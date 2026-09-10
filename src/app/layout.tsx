import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingProvider } from "@/lib/loading-context";
import { ThemeProvider } from "@/lib/theme-context";
import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay";

export const metadata: Metadata = {
  title: "Quiz Master Arena | Full-Stack Examination & Quiz Platform",
  description:
    "Test and master your HTML, CSS, and JavaScript skills with server-authoritative timers, real-time multiplayer rooms, and AI-curated question banks.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash script to apply saved theme instantly before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('codequiz_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200 transition-colors duration-250">
        <ThemeProvider>
          <LoadingProvider>
            <GlobalLoadingOverlay />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
