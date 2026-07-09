import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import GoogleProvider from "next-auth/providers/google";

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
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data } = await axios.post("http://localhost:5000/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          
          if (data && data.accessToken) {
            return {
              id: data.userId.toString(),
              name: data.userName,
              email: credentials.email,
              role: data.role || "USER", 
              accessToken: data.accessToken,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Auth error:", error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!account.id_token) {
          return false;
        }

        try {
          const { data } = await axios.post("http://localhost:5000/auth/google", {
            idToken: account.id_token,
          });

          user.id = data.userId.toString();
          user.name = data.userName;
          (user as any).role = data.role || "USER";
          (user as any).accessToken = data.accessToken;

          (account as any).accessToken = data.accessToken;
          (account as any).userId = data.userId;

          return true;
        } catch (err) {
          console.error("Google sign-in backend error:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === "google") {
        token.accessToken = (account as any).accessToken;
        token.id = (account as any).userId?.toString();
        token.name = user?.name;
        token.email = user?.email;
        token.role = (user as any)?.role || "USER"; // 👈 Store role from Google
      }

      if (account?.provider === "credentials" && user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any)?.role || "USER"; // 👈 Store role from credentials
        token.accessToken = (user as any).accessToken;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if ((session as any).role) token.role = (session as any).role;
      }

      return token;
    },

    async session({ session, token }) {
      // Expose token fields to session
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // After sign-in, always go to /dashboard by default
      if (url.startsWith(baseUrl)) {
        const path = url.slice(baseUrl.length);
        if (path === '' || path === '/' || path.startsWith('/login') || path.startsWith('/api/auth')) {
          return `${baseUrl}/dashboard`;
        }
        return url;
      }
      if (url.startsWith("/")) {
        if (url.startsWith("/login") || url.startsWith("/api/auth")) {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/dashboard`;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
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
