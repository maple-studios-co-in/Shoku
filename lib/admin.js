import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Café admin (owner/staff). Returns { session, tenantId } or { error, status }.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
  const role = session.user.role;
  if (!["owner", "staff", "admin"].includes(role)) return { error: "Forbidden", status: 403 };
  if (!session.user.tenantId) return { error: "No tenant", status: 403 };
  return { session, tenantId: session.user.tenantId };
}

// Platform superadmin (Shoku staff). Returns { session } or { error, status }.
export async function requireSuperadmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
  if (session.user.role !== "superadmin") return { error: "Forbidden", status: 403 };
  return { session };
}
