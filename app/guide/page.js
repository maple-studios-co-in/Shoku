import fs from "fs";
import path from "path";
import { marked } from "marked";
import { safeMarkdownHtml } from "@/lib/sanitize";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GuideView from "./GuideView";

export const dynamic = "force-dynamic";

function render(file) {
  try {
    const md = fs.readFileSync(path.join(process.cwd(), "content", file), "utf8");
    return safeMarkdownHtml(marked.parse(md, { gfm: true }));
  } catch {
    return null;
  }
}

export const metadata = {
  title: "Shoku — Guide",
  description: "How to use Shoku: a guide for café owners, staff and developers.",
};

export default async function GuidePage() {
  const session = await getServerSession(authOptions);
  const staff = ["owner", "staff", "superadmin"].includes(session?.user?.role);

  const userHtml = render("user-guide.md");
  const devHtml = staff ? render("developer-guide.md") : null;

  return <GuideView userHtml={userHtml} devHtml={devHtml} />;
}
