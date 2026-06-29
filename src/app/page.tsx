import CircuitBackground from "@/components/CircuitBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import WebsiteDemos from "@/components/WebsiteDemos";
import WebBuildPricing from "@/components/WebBuildPricing";
import TechMarquee from "@/components/TechMarquee";
import MockupStudio from "@/components/MockupStudio";
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
        <TechMarquee />
        <Services />
        <Portfolio />
        <WebsiteDemos />
        <WebBuildPricing />
        <MockupStudio />
        <Process />
        <LiveMetrics />
        <FAQ />
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
