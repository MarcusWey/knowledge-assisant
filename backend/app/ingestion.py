# backend/app/ingestion.py

import os
import tempfile
from typing import List
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
import fitz                            # PyMuPDF
from easyocr import Reader            # EasyOCR
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "db", "chroma")
EMBEDDING_MODEL    = "granite-embedding:278m"

def get_vectorstore(persist_directory: str = CHROMA_PERSIST_DIR):
    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
    return Chroma(persist_directory=persist_directory, embedding_function=embeddings)

async def ingest_files(files: List[UploadFile]) -> int:
    os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
    vectordb   = get_vectorstore()
    splitter   = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    ocr_reader = Reader(["en"], gpu=False)
    count = 0

    for upload in files:
        suffix = os.path.splitext(upload.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await upload.read())
            path = tmp.name

        # 1) Try text loader
        loader   = PyPDFLoader(path)
        raw_docs = loader.load()
        print(f"[ingest debug] {upload.filename}: PyPDFLoader pages = {len(raw_docs)}")

        # check if any page has text
        has_text = any(doc.page_content.strip() for doc in raw_docs)

        # 2) Fallback to OCR if needed
        if not has_text:
            print(f"[ingest debug] {upload.filename}: falling back to EasyOCR")
            raw_docs = []
            doc = fitz.open(path)
            for i, page in enumerate(doc):
                pix       = page.get_pixmap(dpi=200)
                img_bytes = pix.pil_tobytes(format="PNG")
                ocr_lines = ocr_reader.readtext(img_bytes, detail=0)
                text      = "\n".join(ocr_lines).strip()
                raw_docs.append(Document(page_content=text, metadata={
                    "source": upload.filename,
                    "page":   i
                }))
            doc.close()  # ← ensure we close the PDF handle
            print(f"[ingest debug] {upload.filename}: OCR pages = {len(raw_docs)}")

        # 3) Split & embed
        docs = splitter.split_documents(raw_docs)
        print(f"[ingest debug] {upload.filename}: split into {len(docs)} chunks")

        if docs:
            vectordb.add_documents(docs)
            count += 1
        else:
            print(f"[ingest warning] {upload.filename}: no chunks, skipping.")

        # now safe to delete
        os.remove(path)

    vectordb.persist()
    return count
