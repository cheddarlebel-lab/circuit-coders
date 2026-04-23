import CircuitBackground from "@/components/CircuitBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import WebsiteDemos from "@/components/WebsiteDemos";
import TechMarquee from "@/components/TechMarquee";
import MockupStudio from "@/components/MockupStudio";
import Process from "@/components/Process";
import LiveMetrics from "@/components/LiveMetrics";
import InquiryForm from "@/components/InquiryForm";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <div className="custom-cursor-page">
      <SmoothScroll />
      <CustomCursor />
      <PageLoader />
      <CircuitBackground />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <Services />
        <Portfolio />
        <WebsiteDemos />
        <MockupStudio />
        <Process />
        <LiveMetrics />
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
