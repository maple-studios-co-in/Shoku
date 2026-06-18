import "./globals.css";
import { Inter, Fraunces } from "next/font/google";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Editorial serif for display headings — adds typographic contrast / premium feel.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });

export const metadata = {
  title: "Pista — Order smarter",
  description:
    "Pista is an AI-powered white-label ordering app for cafes and restaurant chains. Get smart recommendations and know exactly what's in your cup.",
};

export const viewport = {
  themeColor: "#7AB04A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
