import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboarding_complete: boolean;
      locale: string;
    } & DefaultSession["user"];
  }
}
