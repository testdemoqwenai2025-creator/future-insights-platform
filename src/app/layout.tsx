import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AETH-1 | Advanced Enterprise Technology Hub",
  description: "AETH-1 v2.0 - The Future of Intelligent Systems. Experience quantum computing, AR/VR, genomics, and AI-powered development in one unified platform.",
  keywords: [
    "AETH-1", 
    "Quantum Computing", 
    "AR/VR", 
    "Genomics Platform", 
    "AI Development", 
    "Next.js", 
    "TypeScript", 
    "Enterprise Technology",
    "Future Tech Lab"
  ],
  authors: [{ name: "AETH-1 Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AETH-1 | Advanced Enterprise Technology Hub",
    description: "The Future of Intelligent Systems - Quantum, AR/VR, Genomics & AI",
    url: "https://aeth.dev",
    siteName: "AETH-1",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AETH-1 | Advanced Enterprise Technology Hub",
    description: "Experience the future of intelligent systems",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
