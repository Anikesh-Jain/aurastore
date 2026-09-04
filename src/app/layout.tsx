import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

const appUrl =
  (process.env.NEXT_PUBLIC_APP_URL || "").replace(/^\uFEFF/, "").trim() ||
  "https://aurastore-nu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "AuraStore | Modern E-Commerce Platform",
  description: "Next-generation full-stack e-commerce marketplace powered by Next.js 15, PostgreSQL & Razorpay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

