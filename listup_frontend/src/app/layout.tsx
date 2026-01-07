import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import BottomNav from "@/components/BottomNav";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";


const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "ListUp - Marketplace",
  description: "Find your next great deal on ListUp, the community-driven marketplace for buying and selling.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ListUp",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${robotoMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.listup.ng" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <FeatureFlagProvider>
            <NavBar />
            <div className="pb-20 md:pb-0">
              {children}
            </div>
            <Analytics />
            <SpeedInsights />
            <Footer />
            <BottomNav />
            <PWAInstallPrompt />

          </FeatureFlagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
