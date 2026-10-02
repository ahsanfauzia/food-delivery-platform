import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;

      if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (userRole !== "ADMIN") return Response.redirect(new URL("/", nextUrl));
      }

      if (nextUrl.pathname.startsWith("/delivery")) {
        if (!isLoggedIn) return false;
        if (userRole !== "DELIVERY_PARTNER" && userRole !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      if (nextUrl.pathname.startsWith("/checkout") || nextUrl.pathname.startsWith("/profile")) {
        if (!isLoggedIn) return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  providers: [],
};
