import type { Metadata } from "next";
import { Fraunces, Public_Sans, Newsreader } from "next/font/google";
import { cookies } from "next/headers";
import TopNav from "@/components/TopNav";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap"
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap"
});

export const metadata: Metadata = {
  title: "StudyMind — Quiet Academic Study Space",
  description: "Study from your own documents using custom-targeted RAG chat, notes, flashcards, and quizzes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeDocId = cookieStore.get("last_opened_doc")?.value;

  return (
    <html lang="en" className="h-full">
      <body
        className={`${fraunces.variable} ${publicSans.variable} ${newsreader.variable} font-sans antialiased bg-paper text-ink min-h-screen flex flex-col`}
      >
        <TopNav activeDocId={activeDocId} />
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </body>
    </html>
  );
}
