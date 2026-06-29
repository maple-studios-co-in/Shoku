import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { slugFromHost, DEFAULT_TENANT_SLUG } from "./tenant";
import { rateLimit, clientIp } from "./rateLimit";

// Opt-in: when COOKIE_DOMAIN is set (e.g. ".shoku.maplestudios.co.in"), the
// auth cookies are shared across all café subdomains so logins work everywhere.
// When unset (local dev / single host), NextAuth's host-only defaults are used.
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "";
const crossSub = !!COOKIE_DOMAIN;
const crossSubCookies = {
  sessionToken: { name: "__Secure-next-auth.session-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: true, domain: COOKIE_DOMAIN } },
  callbackUrl: { name: "__Secure-next-auth.callback-url", options: { sameSite: "lax", path: "/", secure: true, domain: COOKIE_DOMAIN } },
  csrfToken: { name: "__Secure-next-auth.csrf-token", options: { httpOnly: true, sameSite: "lax", path: "/", secure: true, domain: COOKIE_DOMAIN } },
};

export const authOptions = {
  session: { strategy: "jwt" },
  ...(crossSub ? { useSecureCookies: true, cookies: crossSubCookies } : {}),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds, req) {
        if (!creds?.email || !creds?.password) return null;
        const email = creds.email.toLowerCase();
        const host = req?.headers?.host || (typeof req?.headers?.get === "function" ? req.headers.get("host") : "") || "";
        const slug = slugFromHost(host);

        // Throttle credential stuffing / brute force: per IP+email, per host.
        const ip = clientIp(req);
        if (!rateLimit(`login:${ip}:${email}`, { limit: 8, windowMs: 60_000 }).ok) return null;

        let user = null;
        if (slug) {
          // Café subdomain: ONLY that café's own users may sign in here.
          // The platform superadmin is intentionally NOT allowed on café hosts.
          const tenant = await prisma.tenant.findUnique({ where: { slug } });
          if (tenant) {
            user = await prisma.user.findFirst({
              where: { email, tenantId: tenant.id, role: { not: "superadmin" } },
            });
          }
        } else {
          // Platform / apex host: the superadmin, else the default café's users.
          user = await prisma.user.findFirst({ where: { email, role: "superadmin" } });
          if (!user) {
            const tenant =
              (await prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } })) ||
              (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" } }));
            if (tenant) {
              user = await prisma.user.findFirst({
                where: { email, tenantId: tenant.id, role: { not: "superadmin" } },
              });
            }
          }
        }

        if (!user) return null;
        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token?.uid) session.user.id = token.uid;
        session.user.role = token.role || "customer";
        session.user.tenantId = token.tenantId ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
