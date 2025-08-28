'use client';
import { useEffect, useState } from "react";
import DataTable from "./DataTable";

type Order = { id: string; status: string; dueDate?: string | null };

type DashboardData = {
  kpis: { openOrders: number; dueThisWeek: number };
  orders: Order[];
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { headers: { "x-org-id": "dev-org" } })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {!data ? (
        <p>Loading…</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 24 }}>
            <KPI title="Open Orders" value={data.kpis.openOrders} />
            <KPI title="Due This Week" value={data.kpis.dueThisWeek} />
          </div>
          <h3 style={{ marginTop: 16 }}>Upcoming Orders</h3>
          <DataTable rows={data.orders.map(o => ({
            id: o.id,
            status: o.status,
            dueDate: o.dueDate ? new Date(o.dueDate).toLocaleDateString() : "—"
          }))} />
        </>
      )}
    </div>
  );
}

function KPI({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
