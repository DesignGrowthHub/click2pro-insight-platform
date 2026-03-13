import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

import { getAuthEnvironment } from "@/lib/config/env";
import { authenticateUserWithPassword } from "@/lib/server/services/authentication";
import { resolveGoogleAuthUser } from "@/lib/server/services/users";

const authEnvironment = getAuthEnvironment();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: authEnvironment.secret ?? undefined,
  pages: {
    signIn: "/login"
  },
  providers: [
    ...(authEnvironment.googleClientId && authEnvironment.googleClientSecret
      ? [
          GoogleProvider({
            clientId: authEnvironment.googleClientId,
            clientSecret: authEnvironment.googleClientSecret
          })
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await authenticateUserWithPassword(email, password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName ?? user.email,
          fullName: user.fullName,
          country: user.country,
          region: user.region,
          currency: user.currency,
          preferredPaymentProvider: user.preferredPaymentProvider
        };
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const providerProfile =
        profile && typeof profile === "object"
          ? (profile as Record<string, unknown>)
          : null;
      const email =
        typeof providerProfile?.email === "string"
          ? providerProfile.email.trim().toLowerCase()
          : null;
      const emailVerified =
        typeof providerProfile?.email_verified === "boolean"
          ? providerProfile.email_verified
          : true;

      if (!email || !emailVerified) {
        return false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && typeof token.email === "string") {
        const resolvedUser = await resolveGoogleAuthUser({
          email: token.email,
          fullName:
            typeof user?.name === "string"
              ? user.name
              : typeof token.name === "string"
                ? token.name
                : null
        });

        token.sub = resolvedUser.id;
        token.email = resolvedUser.email;
        token.name = resolvedUser.fullName ?? resolvedUser.email;
        token.fullName = resolvedUser.fullName;
        token.country = resolvedUser.country;
        token.region = resolvedUser.region;
        token.currency = resolvedUser.currency;
        token.preferredPaymentProvider = resolvedUser.preferredPaymentProvider;
        return token;
      }

      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.fullName = user.fullName;
        token.country = user.country;
        token.region = user.region;
        token.currency = user.currency;
        token.preferredPaymentProvider = user.preferredPaymentProvider;
        return token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.name = token.name ?? session.user.name ?? null;
        session.user.fullName =
          typeof token.fullName === "string" ? token.fullName : session.user.name ?? null;
        session.user.country =
          typeof token.country === "string" ? token.country : null;
        session.user.region = typeof token.region === "string" ? token.region : null;
        session.user.currency =
          typeof token.currency === "string" ? token.currency : null;
        session.user.preferredPaymentProvider =
          typeof token.preferredPaymentProvider === "string"
            ? token.preferredPaymentProvider
            : null;
      }

      return session;
    }
  }
};
