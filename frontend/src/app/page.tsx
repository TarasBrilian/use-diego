import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Architecture } from "@/components/landing/Architecture";
import { ValueProp } from "@/components/landing/ValueProp";
import { DemoNarrative } from "@/components/landing/DemoNarrative";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-primary font-ui selection:bg-accent-teal/30">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Architecture />
        <ValueProp />
        <DemoNarrative />
      </main>
      <Footer />
    </div>
  );
}
