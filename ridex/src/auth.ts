import connectDb from "@/lib/db"
import User from "@/models/user.model"
import bcrypt from "bcryptjs"
import type { Session } from "next-auth"
import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

const secret = process.env.NEXTAUTH_SECRET!



export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "johndoe@gmail.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                    placeholder: "*****",
                },
            },

            async authorize(credentials) {
                const { email, password } = credentials as { email?: string; password?: string }

                if (!email || !password) {
                    return null
                }

                await connectDb()

                const user = await User.findOne({ email })
                if (!user) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(password, user.password)
                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            },
        }),

        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDb()

                let dbUser = await User.findOne({ email: user.email })

                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                    })
                }

                user.id = dbUser._id.toString()
                user.role = dbUser.role
            }

            return true
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.role = user.role
            }

            return token
        },

        async session({ token, session }: { token: JWT; session: Session }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.name = token.name
                session.user.email = token.email as string
                session.user.role = token.role as string
            }

            return session
        },
    },

    pages: {
        signIn: "/signin",
        error: "/signin",
    },

    session: {
        strategy: "jwt",
        maxAge: 10 * 24 * 60 * 60,
    },

    secret,
})