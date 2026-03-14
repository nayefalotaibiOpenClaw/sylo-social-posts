import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://odesigns.app"),
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
