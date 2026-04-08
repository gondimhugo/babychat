import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Lista do Chá de Bebê",
  title: "Lista do Chá de Bebê",
  description: "Lista universal com reservas em tempo real",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lista do Chá de Bebê",
  },
};

export const viewport: Viewport = {
  themeColor: "#db2777",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold text-brand">Lista do Chá</Link>
            <Link href="/admin" className="text-sm text-slate-600 underline">Admin</Link>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
