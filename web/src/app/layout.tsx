import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/features/auth/auth-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { ThemeProvider, themeInitScript } from "@/lib/theme/provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Body: Be Vietnam Pro (designed for Vietnamese diacritics). Code/headings: JetBrains Mono (Vietnamese + IPA glyphs).
const body = Be_Vietnam_Pro({ variable: "--font-body", subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500"], display: "swap" });
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "English for IT", template: "%s · English for IT" },
  description: "English for IT work: standups, code reviews, incident updates. 5–10 minutes a day. Free.",
  openGraph: { title: "English for IT", description: "Learn the English you use in standups, code reviews and incident updates. Free.", type: "website", siteName: "English for IT" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${code.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
