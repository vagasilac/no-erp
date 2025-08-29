'use client';
import { useState, useRef } from "react";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);

  async function send(textOverride?: string) {
    const text = textOverride ?? input;
    const res = await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setLog(l => [`> ${text}`, data.message ?? JSON.stringify(data), ...l ]);
    if (!textOverride) setInput("");
  }

  const rec = useRef<MediaRecorder | null>(null);
  async function toggleRec() {
    if (rec.current) {
      rec.current.stop();
      rec.current = null;
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: mr.mimeType });
      const resp = await fetch('/api/voice/stt', { method: 'POST', body: blob });
      const { text } = await resp.json();
      if (text) await send(text);
    };
    mr.start();
    rec.current = mr;
  }

  return (
    <div>
      <h2>Chat / Command</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. add order 12 pcs Nordic Chair for Friday" style={{ flex: 1, padding: 8 }} />
        <button onClick={send}>Send</button>
        <button onClick={toggleRec}>🎤</button>
      </div>
      <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 8, padding: 8, height: 260, overflow: "auto" }}>
        {log.map((l, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}
