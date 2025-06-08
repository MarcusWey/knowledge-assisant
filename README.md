# Daythree AI Knowledge Assistant (PoC)

A proof-of-concept AI assistant that lets you upload internal PDF documents, index them into a vector store, and then ask natural-language questions over their content.

**Built with:**

* **Backend:** FastAPI + LangChain + Ollama LLM + ChromaDB vector store
* **Frontend:** Next.js with a single-page, modern chat UI

---

## 🚀 Features

* **Document Ingestion**
  Upload one or more PDFs via the web UI or the `/api/ingest` endpoint.

* **Vector Indexing**
  Uses LangChain + Ollama’s `granite-embedding:278m` to embed document chunks and store them in ChromaDB.

* **Retrieval-Augmented Q\&A**
  Select from three Ollama models (`llama3.2:latest`, `gemma3:latest`, `deepseek-r1:8b`) and ask questions via `/api/ask`.

* **Session History**
  Chat history is stored in-memory by session ID and can be fetched via `/api/session/{session_id}/history`.

* **Modern Chat UI**
  Slick header controls, scrollable chat bubbles, fullscreen indexing spinner, and typing-dot animations.

---

## 📦 Prerequisites

* **Python** 3.8+
* **Node.js** 14+ (with `npm` or `yarn`)
* **Ollama** installed and running locally
* **Models** pulled into Ollama:

  ```bash
  ollama pull granite-embedding:278m
  ollama pull llama3.2:latest
  ollama pull gemma3:latest
  ollama pull deepseek-r1:8b
  ```
* **ChromaDB** for vector storage
* *(Optional)* `poppler-utils` or Tesseract for PDF OCR fallback

---

## 🔧 Backend Setup

1. **Clone & install**

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate            # macOS/Linux
   .venv\\Scripts\\activate             # Windows PowerShell
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **Run Ollama models**

   ```bash
   ollama run granite-embedding:278m
   ollama run llama3.2:latest
   ollama run gemma3:latest
   ollama run deepseek-r1:8b
   ```

3. **Start FastAPI server**

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   * Ingest endpoint: `POST http://127.0.0.1:8000/api/ingest`
   * Ask endpoint:    `POST http://127.0.0.1:8000/api/ask`
   * History endpoint: `GET  http://127.0.0.1:8000/api/session/{session_id}/history`

---

## 💻 Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

2. **Run dev server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🎯 Usage

1. **Upload & Index**

   * Click **Upload PDFs**, select your files.
   * Click **Index** and wait for the fullscreen spinner to complete.

2. **Ask Questions**

   * Choose a model from the dropdown.
   * Type your question in the input bar (or press Enter).
   * A typing-dot animation shows while the assistant generates its reply.

3. **View History**

   * History persists per session in memory.
   * Or fetch via API:

     ```bash
     GET http://127.0.0.1:8000/api/session/<your-session-id>/history
     ```

---

## 🗂 Project Structure

```
knowledge-assistant/
├── backend/
│   ├── app/
│   │   ├── ingestion.py      # PDF loader & Chroma ingestion
│   │   ├── retriever.py      # Chroma retriever setup
│   │   ├── llm.py            # Model aliases & prompt templates
│   │   ├── qa_router.py      # FastAPI endpoints
│   │   └── main.py           # App instantiation & CORS
│   ├── requirements.txt
│   └── db/                   # ChromaDB data
└── frontend/
    ├── pages/
    │   ├── index.js          # Modern chat UI
    │   └── _app.js           # Global CSS import
    ├── utils/
    │   └── api.js            # Helpers to call backend
    ├── package.json
    └── tailwind.config.js    # (if Tailwind is used)
```

---

## ⚙️ Customization

* **Prompt Tuning**
  Edit `backend/app/llm.py`’s `SYSTEM_PROMPT` to adjust assistant behavior.

* **Persistence**
  Change ChromaDB directory in `retriever.py` to persist elsewhere.

* **Production Hardening**

  * Swap in a real session store (Redis, PostgreSQL) instead of in-memory.
  * Add authentication & rate-limiting.
  * Containerize FastAPI & Next.js behind HTTPS.

---

## 📝 License

This PoC is provided “as-is” for demonstration. Feel free to adapt and extend internally.
