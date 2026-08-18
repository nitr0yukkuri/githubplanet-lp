import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHubPlanet — Your code, in orbit.",
  description: "GitHubの活動を、言語の個性を持つ3D惑星として眺めるGitHubPlanet。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
