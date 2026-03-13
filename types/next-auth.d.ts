import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      fullName: string | null;
      country: string | null;
      region: string | null;
      currency: string | null;
      preferredPaymentProvider: string | null;
    };
  }

  interface User {
    fullName: string | null;
    country: string | null;
    region: string | null;
    currency: string | null;
    preferredPaymentProvider: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    fullName?: string | null;
    country?: string | null;
    region?: string | null;
    currency?: string | null;
    preferredPaymentProvider?: string | null;
  }
}
