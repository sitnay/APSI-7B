import type { Metadata } from "next";
import localFont from "next/font/local";
import { Climate_Crisis, DM_Sans, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const climateCrisis = Climate_Crisis({
  variable: "--font-climate-crisis",
  subsets: ["latin"],
  axes: ["YEAR"],
});

const codaCaption = localFont({
  src: "./fonts/CodaCaption-ExtraBold.ttf",
  variable: "--font-coda-caption",
  weight: "800",
  style: "normal",
});

const libreCaslonDisplay = Libre_Caslon_Display({
  variable: "--font-libre-caslon-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kopi OZ | Sistem Pelayanan",
  description: "Login, pembayaran, dan laporan penjualan Kopi OZ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${climateCrisis.variable} ${codaCaption.variable} ${libreCaslonDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
