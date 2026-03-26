import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      firstName: string
      lastName: string
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    firstName: string
    lastName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    id: string
    firstName: string
    lastName: string
  }
}
