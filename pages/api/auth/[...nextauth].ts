import NextAuth, { SessionStrategy } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prisma"

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    },
  }),
  FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  }),
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      }
    },
    from: process.env.EMAIL_FROM
  }),
]



export const authOptions = {
  providers: process.env.NODE_ENV === "development" ? [...providers, CredentialsProvider({
    id: "credentials",
    name: "credentials",
    credentials: {
      email: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const user = await prisma.user.findUnique({
        where: {
          email: credentials?.email,
        }
      })
  
      if (user?.password === credentials?.password) {
        return user
      } else {
        throw new Error('User does not exists. Please make sure you insert the correct email & password.')
      }
    }
  })] : providers,
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: process.env.NODE_ENV === "development" ? "jwt" : "batabase" as SessionStrategy },
}

export default NextAuth(authOptions)
