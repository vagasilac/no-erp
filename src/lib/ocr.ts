export async function parseInvoiceFromImage(_buf: Buffer) {
  // TODO: integrate Azure Form Recognizer or Rossum
  return { number: "INV-TEST", date: new Date().toISOString(), lines: [] };
}
