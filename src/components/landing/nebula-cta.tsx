"use client";

import { ArrowRight } from "lucide-react";

export function NebulaCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />
        
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter text-white mb-8">
          Ready to supercharge <br />
          your workflow?
        </h2>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-12">
          Join thousands of businesses using Atliso to automate their operations and scale faster.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button className="inline-flex h-14 items-center gap-2 rounded-full bg-white text-black px-8 text-base font-medium hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Start for free
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="inline-flex h-14 items-center gap-2 rounded-full border border-white/10 bg-black/50 text-white px-8 text-base font-medium hover:bg-white/10 transition-colors backdrop-blur-md">
            Read Documentation
          </button>
        </div>
      </div>
    </section>
  );
}

