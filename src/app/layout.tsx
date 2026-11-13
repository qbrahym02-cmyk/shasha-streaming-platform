import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BRAND } from "@/lib/config";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "شاشة | SHASHA — أفلام ومسلسلات وأنمي",
    template: "%s | شاشة",
  },
  description:
    "شاشة: منصة بث تجريبية متكاملة — أفلام ومسلسلات وأنمي بمشغل متطور يدعم الجودات المتكيفة والترجمة، مع عضوية VIP وقائمة مشاهدة ومزامنة بين أجهزتك.",
  keywords: ["بث", "أفلام", "مسلسلات", "أنمي", "شاشة", "SHASHA", "streaming"],
  applicationName: BRAND.nameAr,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.nameAr,
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "شاشة | SHASHA — أفلام ومسلسلات وأنمي",
    description: "منصة بث متكاملة بمشغل متطور وعضوية VIP. تعمل على الجوال والكمبيوتر وتُثبّت كتطبيق.",
    type: "website",
    siteName: BRAND.nameAr,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#070b09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        {children}
        <Toaster position="top-center" richColors closeButton dir="rtl" />
      </body>
    </html>
  );
}
