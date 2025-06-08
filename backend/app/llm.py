# backend/app/llm.py

from langchain_ollama.chat_models import ChatOllama

# Exactly these three keys from the frontend dropdown:
MODEL_ALIASES = {
    "deepseek-r1": "deepseek-r1:8b",
    "gemma":       "gemma3:latest",
    "llama3":      "llama3.2:latest",
}

SYSTEM_PROMPT = """You are the Daythree AI Knowledge Assistant—a friendly, professional chatbot that answers questions
*only* using the information provided in the “Context” section below.
- Do not hallucinate or introduce facts not in the context.
- If the answer is not in the context, reply: “I’m sorry, I don’t have enough information to answer that.”
- Keep answers concise, accurate, and in a friendly tone.
- When relevant, quote or reference the context to support your answer.
- If the user’s question is ambiguous, ask a polite clarifying question.
"""

QA_TEMPLATE = SYSTEM_PROMPT + """

Context:
{context}

User Question:
{question}

Assistant Answer:
"""

def get_llm(model_name: str):
    """
    Lookup the alias → real model tag, or error if unknown,
    then return a ChatOllama (plain) that we’ll use with QA_TEMPLATE.
    """
    if model_name not in MODEL_ALIASES:
        supported = ", ".join(MODEL_ALIASES.keys())
        raise ValueError(f"Model '{model_name}' not supported. Choose one of: {supported}")
    real_model = MODEL_ALIASES[model_name]
    # Just return the ChatOllama instance — the prompt template will
    # include SYSTEM_PROMPT when you build your chain in qa_router.py
    return ChatOllama(model=real_model, temperature=0)
