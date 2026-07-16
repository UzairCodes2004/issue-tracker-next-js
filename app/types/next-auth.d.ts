import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;               // string – not a type alias
      permissions: string[];      // string[] – no Permission enum
      accessToken: string;
       registered?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    role?: string;
    permissions?: string[];
    accessToken?: string;
     registered?: string;
  }

  interface Account {
    accessToken?: string;
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: string[];
    accessToken?: string;
  }
}