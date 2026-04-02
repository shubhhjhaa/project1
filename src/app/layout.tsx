import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zaika Junction | Premium Indian Dining",
  description: "An immersive digital dining experience bringing you authentic desi flavors with a modern twist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-orange-500/30 selection:text-white">
        {/* Subtle decorative background pattern hint */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-0 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 0L60 30L30 60L0 30L30 0Z\" fill=\"%23ffffff\" fill-opacity=\"1\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')" }}></div>
        {children}
      </body>
    </html>
  );
}
