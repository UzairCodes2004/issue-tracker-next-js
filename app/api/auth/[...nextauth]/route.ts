import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
});

export { handler as GET, handler as POST };