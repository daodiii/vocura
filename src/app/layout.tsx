import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import SessionTimeout from "@/components/SessionTimeout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mediscribe.no"),
  title: {
    default: "MediScribe AI | Gullstandarden innen medisinsk dokumentasjon",
    template: "%s | MediScribe AI",
  },
  description:
    "Den ledende tale-til-tekst-plattformen for helsepersonell. Sikker, GDPR-kompatibel og utviklet for norske helsetjenester.",
  keywords: [
    "medisinsk dokumentasjon",
    "tale-til-tekst",
    "helsepersonell",
    "journalføring",
    "AI-transkripsjon",
    "GDPR",
    "norsk helsevesen",
  ],
  authors: [{ name: "MediScribe Technologies" }],
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "MediScribe AI",
    title: "MediScribe AI | Gullstandarden innen medisinsk dokumentasjon",
    description:
      "Den ledende tale-til-tekst-plattformen for helsepersonell. Sikker, GDPR-kompatibel og utviklet for norske helsetjenester.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MediScribe AI - Medisinsk dokumentasjon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediScribe AI | Gullstandarden innen medisinsk dokumentasjon",
    description:
      "Den ledende tale-til-tekst-plattformen for helsepersonell. Sikker, GDPR-kompatibel og utviklet for norske helsetjenester.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0891B2" },
    { media: "(prefers-color-scheme: dark)", color: "#0891B2" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('mediscribe_dark_mode');if(d===null||d==='true')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        {/* Animated gradient background */}
        <div className="animated-bg" aria-hidden="true">
          <div className="animated-bg-blob-3" />
        </div>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg focus:text-sm"
        >
          Hopp til hovedinnhold
        </a>
        <SessionTimeout />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
