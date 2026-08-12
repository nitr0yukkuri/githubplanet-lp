import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHubPlanet — Your code, in orbit.",
  description: "GitHubで積み重ねた活動を、世界にひとつの惑星として可視化するGitHubPlanet。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
