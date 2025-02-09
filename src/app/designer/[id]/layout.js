import { Geist, Geist_Mono } from "next/font/google";
import "./../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <div id="app" className="w-screen h-screen flex overflow-hidden relative">
          {children}
      </div>
  );
}
