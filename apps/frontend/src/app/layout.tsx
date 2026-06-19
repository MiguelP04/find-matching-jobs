import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthInitializer } from "../components/AuthInitializer"; // <-- Importado
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Find Matching Jobs",
  description: "Conectando estudiantes con empresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Envolvemos aquí para garantizar la verificación global en el montaje inicial */}
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
