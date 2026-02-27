import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Use Diego — CrossYield Vault",
  description: "Cross-chain yield optimizer powered by Chainlink CCIP, Automation, and CRE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark bg-slate-950 text-slate-50 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
