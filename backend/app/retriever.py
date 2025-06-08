# backend/app/retriever.py
import os
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "db", "chroma")
EMBEDDING_MODEL = "granite-embedding:278m"

def get_retriever(persist_directory: str = CHROMA_PERSIST_DIR, search_kwargs: dict = {"k": 4}):
    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
    vectordb = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
    return vectordb.as_retriever(search_kwargs=search_kwargs)
