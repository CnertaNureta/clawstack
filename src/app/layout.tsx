import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClawStack — Trusted OpenClaw Skill Discovery",
    template: "%s | ClawStack",
  },
  description:
    "The trusted way to discover, rate, and share OpenClaw skills. Security ratings, user reviews, and curated collections for 5,700+ skills.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "ClawStack",
    title: "ClawStack — Trusted OpenClaw Skill Discovery",
    description:
      "Discover safe OpenClaw skills with security ratings. Browse 5,700+ skills, read reviews, and share your stack.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.dev";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ClawStack",
    url: baseUrl,
    description:
      "The trusted way to discover, rate, and share OpenClaw skills. Security ratings for 5,700+ skills.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/skills?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
