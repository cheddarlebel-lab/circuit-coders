import type { Metadata } from "next";
import CircuitBackground from "@/components/CircuitBackground";
import ScrollProgress from "@/components/ScrollProgress";
import FilmGrain from "@/components/FilmGrain";
import StartLanding from "@/components/StartLanding";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Stop Losing Jobs to Missed Calls — Free Shop Audit | Circuit Coders",
  description:
    "Auto, collision, and detail shops lose $3,000–$5,000 in jobs a month from missed calls and a Google listing nobody can find. We build the fix: a website that ranks, a dialed-in Google Business Profile, and a 24/7 AI receptionist. Free audit + live demo.",
  alternates: { canonical: "https://circuitcoders.com/start" },
  // Paid-ads landing page — keep it out of the index so it doesn't compete with the homepage.
  robots: { index: false, follow: true },
};

export default function StartPage() {
  return (
    <div>
      <ScrollProgress />
      <FilmGrain />
      <CircuitBackground />
      <main>
        <StartLanding />
      </main>
      <Footer />
    </div>
  );
}
