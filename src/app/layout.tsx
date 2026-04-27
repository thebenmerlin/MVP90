import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import KeyboardShortcutsProvider from "@/components/mvp90/KeyboardShortcutsProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MVP90",
  description: "Venture Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e){}
})();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <KeyboardShortcutsProvider>
          {children}
        </KeyboardShortcutsProvider>
      </body>
    </html>
  );
}
