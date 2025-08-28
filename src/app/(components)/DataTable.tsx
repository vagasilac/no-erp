'use client';

export default function DataTable({ rows }: { rows: Record<string, any>[] }) {
  if (!rows.length) return <p>No data.</p>;
  const cols = Object.keys(rows[0]);
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {cols.map(c => (
            <th key={c} style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {cols.map(c => (
              <td key={c} style={{ borderBottom: "1px solid #eee", padding: 8 }}>{String(r[c] ?? "")}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
