import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import axios from "axios";
import { email } from "zod";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },


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
   
   
              // NEST JS AUTHORIZE FUNCTION

   async authorize(credentials){
    if(!credentials?.email||!credentials?.password)
      return null;
    try{
      const {data}= await axios.post("http://localhost:5000/auth/login",{
        email:credentials.email,
        password:credentials.password
      });

      return {
        id:data.user.id,
        name:data.user.name,
        email:data.user.email
      }
    }
    catch{
      return null
    }
   }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // When update() is called from the client, sync new values into token
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
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