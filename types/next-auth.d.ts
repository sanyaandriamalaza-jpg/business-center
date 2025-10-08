import { ProfileType } from "@/src/lib/type";
import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName?: string;
      profilePictureUrl?: string | null;
      profileType: ProfileType;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    firstName?: string;
    profilePictureUrl?: string | null;
    profileType: ProfileType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    firstName?: string;
    profilePictureUrl?: string | null;
    profileType: ProfileType;
  }
}