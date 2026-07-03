// Pure POS helpers — no server/db imports so they stay unit-testable.

// Split a tax amount into CGST/SGST halves (integer INR; sgst gets the odd rupee).
export function gstSplit(tax) {
  const cgst = Math.floor((tax || 0) / 2);
  return { cgst, sgst: (tax || 0) - cgst };
}

// "INV" + year + zero-padded sequence → INV-2026-00042
export function formatInvoiceNo(prefix, year, seq) {
  return `${prefix}-${year}-${String(seq).padStart(5, "0")}`;
}
