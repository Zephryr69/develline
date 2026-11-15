import Hero from "@/components/landing/Hero";
import Outcomes from "@/components/landing/Outcomes";
import Pain from "@/components/landing/Pain";
import Steps from "@/components/landing/Steps";
import Audiences from "@/components/landing/Audiences";
import ShipCardFeature from "@/components/landing/ShipCardFeature";
import Compare from "@/components/landing/Compare";
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Outcomes />
      <Pain />
      <Steps />
      <Audiences />
      <ShipCardFeature />
      <Compare />
      <Faq />
      <FinalCta />
    </>
  );
}
