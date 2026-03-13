import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CommerceRegionProvider } from "@/components/region/commerce-region-provider";
import { getServerCommerceRegionContext } from "@/lib/region/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://insight.click2pro.com"),
  title: {
    default: "Click2Pro Insight Platform",
    template: "%s | Click2Pro Insight Platform"
  },
  description:
    "Premium behavioral insight assessments, report previews, and account experiences for insight.click2pro.com."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialRegionContext = await getServerCommerceRegionContext();

  return (
    <html lang="en" className={inter.variable}>
      <body className="app-shell">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_42%)]" />
        <CommerceRegionProvider initialContext={initialRegionContext}>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CommerceRegionProvider>
      </body>
    </html>
  );
}
