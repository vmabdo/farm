import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Feedlot ERP",
  description: "Premium Cattle & Calves Feedlot Management System",
};

import { LanguageProvider } from '@/components/LanguageContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden flex bg-slate-50 text-slate-900`}
      >
        <LanguageProvider>
          <Sidebar className="hidden md:flex" />
          <main className="flex-1 overflow-y-auto w-full flex flex-col relative bg-slate-50">
            <div className="absolute inset-0 bg-grid-slate-100 bg-[size:32px_32px] pointer-events-none opacity-50"></div>
            <div className="flex-1 w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 z-10 transition-all duration-300">
              {children}
            </div>
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
