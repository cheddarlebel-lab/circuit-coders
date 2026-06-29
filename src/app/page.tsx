import CircuitBackground from "@/components/CircuitBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import WebsiteDemos from "@/components/WebsiteDemos";
import WebBuildPricing from "@/components/WebBuildPricing";
import MissedCallCTA from "@/components/MissedCallCTA";
import SystemArchitecture from "@/components/SystemArchitecture";
import VoicemailCalculator from "@/components/VoicemailCalculator";
import Process from "@/components/Process";
import LiveMetrics from "@/components/LiveMetrics";
import FAQ from "@/components/FAQ";
import InquiryForm from "@/components/InquiryForm";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <div>
      <ScrollProgress />
      <CircuitBackground />
      <Navbar />
      <main>
        <Hero />
        <MissedCallCTA />
        <SystemArchitecture />
        <VoicemailCalculator />
        <Services />
        <Portfolio />
        <WebsiteDemos />
        <WebBuildPricing />
        <Process />
        <LiveMetrics />
        <FAQ />
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
