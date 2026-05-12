import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { verifyPassword } from "./password"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user || !user.password) return null

          const isValid = verifyPassword(
            credentials.password as string,
            user.password
          )

          if (!isValid) return null

          return {
            id: user.id,
            email: user.email ?? "",
            name: user.name ?? "",
            role: user.role,
            image: user.image,
          }
        } catch (err) {
          console.error("Authorize error:", err)
          return null
        }
      },
    }),
  ],
})
