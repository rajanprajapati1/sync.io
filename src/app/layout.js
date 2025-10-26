"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import InstallPrompt from "./components/pwa/InstallPrompt";
import { PWAProvider } from "./components/pwa/PWAProvider";
import NotificationProvider from "./components/ui/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Sync Music Player" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SyncMusic" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1976d2" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PWAProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <InstallPrompt />
            </NotificationProvider>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
