import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import "./styles.css";

const title =
  "Jupyter Notebook Execution Count Reset — Fix .ipynb Cell Numbers";
const description =
  "Fix Jupyter notebook execution counts without re-running cells. Renumber out-of-order In [n] in .ipynb files while keeping outputs. Ideal when rerunning runs took hours. Free, browser-only, no upload.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "jupyter notebook execution count reset",
    "reset jupyter execution count",
    "reset jupyter cell count",
    "fix notebook cell numbers",
    "ipynb execution count",
    "renumber jupyter cells",
    "in [n] out of order",
    "jupyter kernel restart cell numbers",
    ".ipynb fix execution count",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "Jupyter Execution Count Reset",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}