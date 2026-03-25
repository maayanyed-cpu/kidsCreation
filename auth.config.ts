import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-safe auth config — no Node.js-only imports (no Prisma, no sqlite).
 * Used by middleware.ts (Edge Runtime) and extended by auth.ts (Node.js).
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    // Dev-only: skip OAuth in local development
    ...(process.env.NODE_ENV !== "production"
      ? [
          Credentials({
            id: "dev-login",
            name: "Dev Login",
            credentials: {},
            authorize() {
              // Returns the seeded test parent — no password, no OAuth needed
              return {
                id: "user_test_001",
                name: "Test Parent",
                email: "test@example.com",
                image: null,
                emailVerified: null,
                onboarding_complete: true,
                locale: "en",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Merge arbitrary fields passed to useSession().update()
      if (trigger === "update" && session) {
        return { ...token, ...(session as Record<string, unknown>) };
      }
      // On first sign-in, persist custom fields in JWT
      if (user) {
        token.id = user.id!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.onboarding_complete = u.onboarding_complete ?? false;
        token.locale = u.locale ?? "en";
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.onboarding_complete = (token.onboarding_complete as boolean) ?? false;
        session.user.locale = (token.locale as string) ?? "en";
      }
      return session;
    },
  },
};
