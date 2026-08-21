import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { NotificationScheduler } from "@/components/notifications/NotificationScheduler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymTracker — Rehab & Fitness",
  description: "Mobile-first physical therapy and gym routine exercise tracker.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GymTracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-gray-950">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-gray-100 antialiased selection:bg-blue-600 selection:text-white`}>
        <main className="min-h-screen">
          {children}
        </main>
        <NotificationScheduler />
        <BottomNav />
      </body>
    </html>
  );
}
