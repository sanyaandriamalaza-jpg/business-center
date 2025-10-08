import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, verifyPassword } from "@/src/lib/customfunction"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"
import { ProfileType } from "@/src/lib/type"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null

        const user = await getUserByEmail(credentials.email)
        if (!user) return null

        const isValid = await verifyPassword(credentials.password, user.password_hash)
        if (!isValid) return null

        // Retourne l’objet user qui sera stocké dans la session
        return { id: `${user.id}`, email: user.email, name: user.name, firstName: user.firstName, image: user.profilePictureUrl, profileType: user.profileType }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7, // 7 jours en secondes
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.image = user.profilePictureUrl;
        token.profileType = user.profileType;
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.firstName = token.firstName;
        session.user.image = token.image as string | null | undefined;
        session.user.profileType = token.profileType as ProfileType;
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }