import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer a Business, Earn $250 | Circuit Coders",
  description:
    "Know a business owner losing jobs to missed calls or stuck with a dead website? Refer them to Circuit Coders — if they sign on, you get $250. Cash, no limit.",
  alternates: { canonical: "https://www.circuitcoders.com/refer" },
  openGraph: {
    title: "Refer a Business, Earn $250 | Circuit Coders",
    description:
      "Send us a business owner who needs a website, better Google presence, or an AI receptionist. If they sign, $250 is yours.",
    url: "https://www.circuitcoders.com/refer",
    type: "website",
  },
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
