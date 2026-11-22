import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { ThemeProvider, themeInitScript } from "./component/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CodeWise",
  description: "AI-powered code documentation generator.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the theme class before first paint so the page never flashes
            the wrong ground colour. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrains.variable} bg-ground text-ink min-h-screen antialiased`}
      >
        <ThemeProvider>
          <main className="flex flex-col min-h-screen">
            {children}
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  'bg-surface border border-border text-ink shadow-float rounded-md text-sm',
                description: 'text-ink-2',
                actionButton: 'bg-accent text-accent-fg',
                cancelButton: 'bg-surface-2 text-ink-2',
              },
            }}
          />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
