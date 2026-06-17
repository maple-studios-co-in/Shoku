import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Returns { session } when the caller is an admin, otherwise { error, status }.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 };
  if (session.user.role !== "admin") return { error: "Forbidden", status: 403 };
  return { session };
}
