import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { Player } from "@/components/Player";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maxify - Your Personal Music Library",
  description: "Upload, organize, and stream your personal music collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PlayerProvider>
            <div className="min-h-screen bg-background">
              {children}
              <Player />
            </div>
            <Toaster />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}