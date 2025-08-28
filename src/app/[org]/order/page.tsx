'use client';
import { useState } from 'react';

export default function OrderPage({ params }: { params: { org: string } }) {
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  async function submit() {
    const text = `place order ${qty} ${product}`;
    const res = await fetch(`/api/command`, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-org-id': params.org }, body: JSON.stringify({ text }) });
    const data = await res.json();
    setMsg(data.message || JSON.stringify(data));
  }

  return (
    <div>
      <h2>Place an Order</h2>
      <input placeholder="Product name" value={product} onChange={e=>setProduct(e.target.value)} />
      <input type="number" min={1} value={qty} onChange={e=>setQty(Number(e.target.value))} />
      <button onClick={submit}>Submit</button>
      <p>{msg}</p>
    </div>
  );
}
