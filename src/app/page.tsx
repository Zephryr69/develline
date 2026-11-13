import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import Problem from "@/components/landing/Problem";
import Steps from "@/components/landing/Steps";
import ShipCardFeature from "@/components/landing/ShipCardFeature";
import Compare from "@/components/landing/Compare";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Problem />
        <Steps />
        <ShipCardFeature />
        <Compare />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
