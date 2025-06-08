// frontend/utils/api.js
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export async function ingestDocuments(files) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await axios.post(`${API_BASE}/ingest`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function askQuestion(sessionId, question, model) {
  const res = await axios.post(
    `${API_BASE}/ask`,
    { session_id: sessionId, question, model },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data.answer;
}

export async function getHistory(sessionId) {
  const res = await axios.get(`${API_BASE}/session/${sessionId}/history`);
  return res.data.history;
}
