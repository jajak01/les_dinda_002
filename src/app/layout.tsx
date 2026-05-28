import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar"; // <-- 1. Import your Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CerdasIND - Aplikasi Pelacakan Les Privat",
  description: "Aplikasi untuk mengelola data siswa, jadwal les, dan pembayaran les privat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* 2. Add bg-slate-50 and min-h-screen so the app looks modern and covers the whole page */}
      <body className={`${inter.className} font-sans antialiased bg-slate-50 min-h-screen flex flex-col`}>
        
        {/* 3. Drop the Navbar right at the top of the body */}
        <Navbar />
        
        {/* 4. Wrap children in a <main> tag to center your dashboard and give it padding */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}