# backend/app/qa_router.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from typing import List
from . import ingestion, retriever, llm
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

router = APIRouter()

# In-memory session log
session_logs: dict[str, list[dict[str,str]]] = {}

class AskRequest(BaseModel):
    session_id: str
    question: str
    model: str

@router.post("/ingest")
async def ingest_files(files: List[UploadFile] = File(...)):
    """
    Endpoint to upload and ingest PDF documents.
    """
    try:
        count = await ingestion.ingest_files(files)
        return {"message": f"Successfully ingested {count} documents."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask")
async def ask(request: AskRequest = Body(...)):
    """
    Endpoint to ask a question. Returns an answer string.
    """
    # 1️⃣ Load retriever from your ChromaDB
    retr = retriever.get_retriever()

    # 2️⃣ Instantiate the chosen LLM
    chat_llm = llm.get_llm(request.model)

    # 3️⃣ Build prompt chain using your QA_TEMPLATE (which includes the system prompt)
    prompt = PromptTemplate(
        template=llm.QA_TEMPLATE,
        input_variables=["context", "question"],
    )

    # 4️⃣ Assemble a RetrievalQA chain of type "stuff"
    qa_chain = RetrievalQA.from_chain_type(
        llm=chat_llm,
        chain_type="stuff",
        retriever=retr,
        chain_type_kwargs={"prompt": prompt},
    )

    # 5️⃣ Run the chain
    try:
        answer = qa_chain.run(request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {e}")

    # 6️⃣ Log under session
    logs = session_logs.setdefault(request.session_id, [])
    logs.append({"question": request.question, "answer": answer})

    return {"answer": answer}

@router.get("/session/{session_id}/history")
async def session_history(session_id: str):
    """
    Retrieve past Q&A for the given session.
    """
    return {"history": session_logs.get(session_id, [])}
