import type { Metadata } from "next";
import KeyboardShortcutsProvider from "@/components/mvp90/KeyboardShortcutsProvider";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
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
