// frontend/pages/index.js

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ingestDocuments, askQuestion, getHistory } from "../utils/api";

// Reusable pill button
function Btn({ children, ...props }) {
  return (
    <button {...props} style={{
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      border: "none",
      background: "var(--primary-light)",
      color: "var(--primary-dark)",
      fontWeight: 500,
      cursor: "pointer"
    }}>
      {children}
    </button>
  );
}

export default function Home() {
  const [sessionId] = useState(() => uuidv4());
  const [model, setModel] = useState("llama3");
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef();

  // Load history once
  useEffect(() => {
    getHistory(sessionId).then((hist) => {
      const msgs = hist.flatMap(h => [
        { from: "user", text: h.question },
        { from: "bot",  text: h.answer   },
      ]);
      setMessages(msgs);
    });
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle PDF ingestion
  async function handleIndex() {
    if (!files.length) return;
    setIsIndexing(true);
    try {
      const res = await ingestDocuments(files);
      alert(res.message);
    } catch (e) {
      alert("Index error: " + e.message);
    }
    setIsIndexing(false);
  }

  // Handle sending question
  async function handleSend(prefilled) {
    const q = prefilled ?? input.trim();
    if (!q) return;
    setMessages(m => [...m, { from: "user", text: q }]);
    setInput("");
    setIsAsking(true);
    try {
      const ans = await askQuestion(sessionId, q, model);
      setMessages(m => [...m, { from: "bot", text: ans }]);
    } catch (e) {
      setMessages(m => [...m, { from: "bot", text: "Error: " + e.message }]);
    }
    setIsAsking(false);
  }

  return (
    <div className="app">
      {/* Spinner Overlay */}
      {isIndexing && (
        <div className="overlay">
          <div className="spinner"/>
        </div>
      )}

      {/* Header Bar */}
      <header className="header">
        <h1>Daythree Knowledge Assistant</h1>
        <div className="controls">
          <select value={model} onChange={e => setModel(e.target.value)}>
            <option value="llama3">llama3</option>
            <option value="gemma">gemma3</option>
            <option value="deepseek-r1">deepseek-r1</option>
          </select>
          <label htmlFor="file" className="upload-btn">📁 Upload PDFs</label>
          <input
            id="file"
            type="file"
            multiple
            accept=".pdf"
            style={{ display: "none" }}
            onChange={e => setFiles(Array.from(e.target.files))}
          />
          <Btn onClick={handleIndex} disabled={isIndexing}>
            {isIndexing ? "Indexing…" : "Index"}
          </Btn>
        </div>
      </header>

      {/* Chat Panel */}
      <main className="chat-panel">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.from}`}>
            {msg.text}
          </div>
        ))}

        {/* Typing Indicator */}
        {isAsking && (
          <div className="msg bot">
            <div className="dots">
              <span/><span/><span/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </main>

      {/* Input Bar */}
      <footer className="input-bar">
        <input
          type="text"
          className="text-input"
          placeholder="Ask me anything…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && handleSend()}
        />
        <Btn onClick={() => handleSend()} disabled={isAsking}>Send</Btn>
      </footer>

      {/* Styles */}
      <style jsx global>{`
        :root {
          --primary: #3b82f6;
          --primary-light: #bfdbfe;
          --primary-dark: #1e40af;
          --bg: #eff6ff;
          --text: #1e40af;
        }
        body, html {
          margin: 0; padding: 0;
        }
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, sans-serif;
        }
        .overlay {
          position: fixed; inset: 0;
          background: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }
        .spinner {
          width: 48px; height:48px;
          border: 6px solid var(--primary-light);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
          margin: 0; font-size: 1.25rem;
        }
        .controls {
          display: flex; gap: 0.5rem; align-items: center;
        }
        .controls select {
          padding: 0.4rem 0.75rem;
          border: none; border-radius: 0.375rem;
          background: var(--primary-light);
          color: var(--primary-dark);
          font-size: 0.9rem;
        }
        .upload-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 0.375rem;
          background: var(--primary-light);
          color: var(--primary-dark);
          cursor: pointer;
        }
        .upload-btn:hover {
          background: var(--primary); color: white;
        }

        .chat-panel {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .msg {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          word-wrap: break-word;
        }
        .msg.user {
          align-self: flex-end;
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 0.2rem;
        }
        .msg.bot {
          align-self: flex-start;
          background: white;
          color: var(--text);
          border-bottom-left-radius: 0.2rem;
        }

        .dots {
          display: flex; gap: 0.4rem;
        }
        .dots span {
          width:8px; height:8px;
          background: var(--primary);
          border-radius:50%;
          animation: bounce 1s infinite ease-in-out;
        }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%,80%,100% { transform: scale(0); }
          40%         { transform: scale(1); }
        }

        .input-bar {
          display: flex; padding: 0.75rem 1rem;
          background: white;
          box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
          gap: 0.5rem;
        }
        .text-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid var(--primary-light);
          border-radius: 9999px;
          font-size: 1rem;
          outline: none;
        }
        .text-input:focus {
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
