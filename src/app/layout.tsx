import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";

import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mantena",
  description: "Gestão colaborativa de manutenção e organização",
  applicationName: "Mantena",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#6B3418",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
