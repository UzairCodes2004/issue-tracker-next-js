import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import axios from "axios";
import { email } from "zod";
import GoogleProvider from "next-auth/providers/google"

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!googleClientId || !googleClientSecret) {
  throw new Error("Missing Google OAuth environment variables");
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },




      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // send req to nest js login endpoint
          const { data } = await axios.post("http://localhost:5000/auth/login", {
            email: credentials.email,
            password: credentials.password
          });

          // nest js response returns accessToken: string, userId: number, userName: string 
          if (data && data.accessToken) {
            return {
              id: data.userId.toString(),
              name: data.userName,
              email: credentials.email,
              accessToken: data.accessToken
            };
          }
          return null;
        } catch (error: any) {
          console.error("Auth error:", error.response?.data || error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { data } = await axios.post("http://localhost:5000/auth/google", {
            email: user.email,
            name: user.name,
          });

          (user as any).id = data.userId.toString();
          (user as any).accessToken = data.accessToken;
          return true;
        } catch (err) {
          console.error("Google sign-in backend error:", err);
          return false;
        }
      }
      return true; 
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = (user as any).accessToken;
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === "/" || url.includes("/login")) {
        return `${baseUrl}/dashboard`;
      }
      
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          return url;
        }
      } catch {
        
      }
      return `${baseUrl}/dashboard`;
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
//COMMENTEED THIS AUTHORIZE FUNCTION AS IT WAS PART OF NEXT JS BACKGROUND


// async authorize(credentials) {
//   if (!credentials?.email || !credentials?.password) return null;

//   const user = await prisma.users.findUnique({
//     where: { email: credentials.email }
//   });

//   if (!user) return null;

//   const isValid = await bcrypt.compare(credentials.password, user.password);

//   if (!isValid) return null;

//   return {
//     id: user.id.toString(),
//     name: user.name,
//     email: user.email
//   };
// }