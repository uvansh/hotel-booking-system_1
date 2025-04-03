import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes';
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nestio.",
  description: "An affordable and fast hotel booking site.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider 
    appearance={{
        baseTheme: neobrutalism,
      }}
      >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
          <Navbar />
          <main className="pt-20">
            {children}
            <Toaster/>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
