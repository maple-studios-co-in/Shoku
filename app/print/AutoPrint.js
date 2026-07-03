"use client";

import { useEffect } from "react";

// Fires the browser print dialog once the ticket has rendered.
export default function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, []);
  return null;
}
