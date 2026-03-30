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
import TopBar from "@/components/TopBar";
import { SidebarProvider } from "@/components/SidebarContext";

export const metadata: Metadata = {
  title: "نظام إدارة المزرعة",
  description: "نظام متكامل لإدارة عجول التسمين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased
          h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900
          print:h-auto print:min-h-screen print:overflow-visible print:block`}
      >
          <SidebarProvider>
            {/* Top header bar (hamburger + title) */}
            <TopBar />

            {/* Body: sidebar + main content side by side */}
            <div className="flex flex-1 overflow-hidden print:block print:overflow-visible print:h-auto">
              <Sidebar />
              <main className="flex-1 overflow-y-auto w-full flex flex-col relative bg-slate-50 animate-in fade-in duration-500
                               print:overflow-visible print:h-auto print:flex-none print:block print:w-full print:max-w-none print:relative print:bg-white">
                <div className="absolute inset-0 bg-grid-slate-100 bg-[size:32px_32px] pointer-events-none opacity-50 print:hidden" />
                <div className="flex-1 w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 z-10
                                print:max-w-none print:p-0 print:block print:w-full">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
      </body>
    </html>
  );
}
