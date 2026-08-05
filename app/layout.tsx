import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClientCore — CRM Overview",
  description: "A secure, modern workspace for customers, opportunities, projects and reports.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
