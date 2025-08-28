'use client';
import { useState } from "react";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);

  async function send() {
    const res = await fetch("/api/command", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-org-id": "dev-org" },
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();
    setLog(l => [`> ${input}`, data.message ?? JSON.stringify(data), ...l ]);
    setInput("");
  }

  return (
    <div>
      <h2>Chat / Command</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. add order 12 pcs Nordic Chair for Friday" style={{ flex: 1, padding: 8 }} />
        <button onClick={send}>Send</button>
      </div>
      <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 8, padding: 8, height: 260, overflow: "auto" }}>
        {log.map((l, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}
