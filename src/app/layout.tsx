import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import SessionTimeout from "@/components/SessionTimeout";
import CommandPalette from "@/components/CommandPalette";
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

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vocura.no"),
  title: {
    default: "Vocura | AI-drevet medisinsk dokumentasjon",
    template: "%s | Vocura",
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
  authors: [{ name: "Vocura Technologies" }],
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "Vocura",
    title: "Vocura | Gullstandarden innen medisinsk dokumentasjon",
    description:
      "Den ledende tale-til-tekst-plattformen for helsepersonell. Sikker, GDPR-kompatibel og utviklet for norske helsetjenester.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vocura - Medisinsk dokumentasjon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocura | Gullstandarden innen medisinsk dokumentasjon",
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
    { media: "(prefers-color-scheme: light)", color: "#5E6AD2" },
    { media: "(prefers-color-scheme: dark)", color: "#5E6AD2" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('vocura_dark_mode');if(d==='true')document.documentElement.classList.add('dark');var a=localStorage.getItem('vocura_accent_theme');if(a&&['purple','red','blue'].indexOf(a)!==-1)document.documentElement.setAttribute('data-accent',a)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#5E6AD2] focus:text-white focus:rounded-lg focus:text-sm"
        >
          Hopp til hovedinnhold
        </a>
        <SessionTimeout />
        <CommandPalette />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
