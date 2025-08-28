import "@/styles/globals.css";
import { ReactNode } from "react";

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Segoe UI, Arial" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
          <h1>Conversational Micro‑ERP (MVP)</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
