import { NextResponse } from "next/server";

const BASE_DOMAIN = process.env.BASE_DOMAIN || "pista.maplestudios.co.in";
const RESERVED = ["www", "console", "admin", "api", "app", "mail", "assets", "static", "super"];

// Parse the café subdomain and pass it downstream as a header so server
// components / route handlers can resolve the tenant. (Prisma can't run here.)
export function middleware(req) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  let slug = "";
  if (host.endsWith(`.${BASE_DOMAIN}`) && host !== `www.${BASE_DOMAIN}`) {
    const sub = host.slice(0, -(BASE_DOMAIN.length + 1)).split(".")[0];
    if (sub && !RESERVED.includes(sub)) slug = sub;
  }

  const requestHeaders = new Headers(req.headers);
  if (slug) requestHeaders.set("x-tenant-slug", slug);
  else requestHeaders.delete("x-tenant-slug");

  // On a café subdomain, the root shows THAT café's storefront (its menu),
  // not Pista's marketing landing. The apex/www still shows the platform site.
  if (slug && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/menu";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip static assets, the docs site, and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|docs|.*\\.).*)"],
};
