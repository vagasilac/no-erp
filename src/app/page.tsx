import Dashboard from "./(components)/Dashboard";
import ChatPanel from "./(components)/ChatPanel";

export default function Page() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <Dashboard />
      <ChatPanel />
    </div>
  );
}
