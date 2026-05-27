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

const SITE_NAME = "Persistent Tasks";
const SITE_DESCRIPTION =
  "A professional persistent todo application built with Next.js and MongoDB.";

function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return "http://localhost:3000";
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} | Dev Weekends`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "todo app",
    "task manager",
    "nextjs",
    "mongodb",
    "persistent tasks",
    "productivity",
  ],
  alternates: {
    canonical: "/",
  },
  category: "productivity",
  openGraph: {
    type: "website",
    url: "/",
    title: `${SITE_NAME} | Dev Weekends`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Dev Weekends`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
