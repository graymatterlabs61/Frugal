import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://frugal-66tx.onrender.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = (await res.json()) as {
            data: {
              token: string;
              user: { id: string; email: string; fullName?: string | null };
            };
          };
          const { token, user } = data.data;
          return {
            id: user.id,
            email: user.email,
            name: user.fullName ?? null,
            backendToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: profile.email,
              name: (profile as { name?: string }).name ?? profile.email.split("@")[0],
            }),
          });
          if (!res.ok) return false;
          const data = (await res.json()) as {
            data: { token: string; user: { id: string } };
          };
          (user as Record<string, unknown>).backendToken = data.data.token;
          (user as Record<string, unknown>).id = data.data.user.id;
        } catch {
          return false;
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.sub = user.id;
        const u = user as Record<string, unknown>;
        if (u.backendToken) token.backendToken = u.backendToken as string;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.backendToken) session.backendToken = token.backendToken;
      return session;
    },
  },
});
