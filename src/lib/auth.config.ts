import type { NextAuthConfig } from "next-auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: Role
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      image?: string | null
    }
  }
}

declare module "next-auth" {
  interface JWT {
    id: string
    role: Role
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = (user as { role: Role }).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  providers: [], // Add providers in auth.ts to keep this edge-compatible
} satisfies NextAuthConfig
