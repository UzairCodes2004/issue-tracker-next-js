import NextAuth, { Account, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import GoogleProvider from "next-auth/providers/google";

// ─── Extended types ────────────────────────────────────────────────────────

interface ExtendedUser extends User {
  id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}

interface ExtendedAccount extends Account {
  accessToken?: string;
  userId?: string;
}

interface ExtendedJWT extends JWT {
  id?: string;
  role?: string;
  accessToken?: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    accessToken: string;
  };
  accessToken?: string;
}

// ─── Environment check ─────────────────────────────────────────────────────

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

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
            } as ExtendedUser;
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null; // ✅ Always return null on error
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const googleAccount = account as ExtendedAccount;

        if (!googleAccount.id_token) {
          return false;
        }

        try {
          const { data } = await axios.post("http://localhost:5000/auth/google", {
            idToken: googleAccount.id_token,
          });

          const googleUser = user as ExtendedUser;
          googleUser.id = data.userId.toString();
          googleUser.name = data.userName;
          googleUser.role = data.role || "USER";
          googleUser.accessToken = data.accessToken;

          googleAccount.accessToken = data.accessToken;
          googleAccount.userId = data.userId.toString();

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      const typedToken = token as ExtendedJWT;

      if (account?.provider === "google") {
        const googleAccount = account as ExtendedAccount;
        typedToken.accessToken = googleAccount.accessToken;
        typedToken.id = googleAccount.userId?.toString();
        typedToken.name = user?.name;
        typedToken.email = user?.email;
        typedToken.role = (user as ExtendedUser)?.role || "USER";
        return typedToken as JWT;
      }

      if (account?.provider === "credentials" && user) {
        const credentialsUser = user as ExtendedUser;
        typedToken.id = credentialsUser.id;
        typedToken.name = credentialsUser.name;
        typedToken.email = credentialsUser.email;
        typedToken.role = credentialsUser.role || "USER";
        typedToken.accessToken = credentialsUser.accessToken;
        return typedToken as JWT;
      }

      if (trigger === "update" && session) {
        const updatedSession = session as ExtendedSession;
        if (updatedSession.user?.name) typedToken.name = updatedSession.user.name;
        if (updatedSession.user?.email) typedToken.email = updatedSession.user.email;
        if (updatedSession.user?.role) typedToken.role = updatedSession.user.role;
        return typedToken as JWT;
      }

      return token;
    },

    async session({ session, token }) {
      const typedToken = token as ExtendedJWT;

      const extendedSession: ExtendedSession = {
        ...session,
        user: {
          ...session.user,
          id: typedToken.id || "",
          role: typedToken.role || "USER",
          accessToken: typedToken.accessToken || "",
        },
        accessToken: typedToken.accessToken,
      };

      return extendedSession;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        const path = url.slice(baseUrl.length);
        if (path === "" || path === "/" || path.startsWith("/login") || path.startsWith("/api/auth")) {
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