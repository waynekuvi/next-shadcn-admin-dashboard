"use client";

import { useEffect } from "react";
import { BackgroundBeams } from "@/components/landing/background-beams";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Services } from "@/components/landing/services";
import { Testimonials } from "@/components/landing/testimonials";
import { Footer } from "@/components/landing/footer";
import { Pricing } from "@/components/landing/pricing";
import { MobileSuite } from "@/components/landing/mobile-suite";
import { FAQ } from "@/components/landing/faq";

export default function LandingPage() {
  useEffect(() => {
    // Simple cursor spotlight effect for cards (optional, can keep if desired)
    const cards = document.querySelectorAll('.card-shine');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e: any) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }, []);

  return (
    // Force Dark Mode for Landing Page Only
    <div className="dark">
      <div className="min-h-screen bg-[#050505] text-neutral-300 antialiased selection:bg-white/20 selection:text-white overflow-x-hidden font-sans">
        <BackgroundBeams />

        <Navbar />
        <main className="flex-1 relative z-10">
          <Hero />
          <HowItWorks />
          <Services />
          <MobileSuite />
          <Pricing />
          <Testimonials />
          <FAQ />
        </main>
        <Footer />
      </div>
    </div>
  );
}
