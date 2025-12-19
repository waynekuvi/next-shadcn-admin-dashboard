"use client";

import { ArrowRight, Sparkles, Users, Zap, Shield } from "lucide-react";

export function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 mb-24 relative">
      <div className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual */}
        <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[32px] opacity-20 blur-xl" />
            <div className="border border-white/10 bg-[#0A0A0B] backdrop-blur-xl rounded-[28px] p-2 shadow-2xl relative overflow-hidden">
                <img 
                    src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd276cb3-a53d-4683-83d8-727dc1ffaf68_1600w.webp" 
                    alt="AI platform" 
                    className="w-full h-[500px] object-cover rounded-[20px] opacity-80 hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex -space-x-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0B] bg-neutral-800" />
                            ))}
                        </div>
                        <span className="text-sm text-neutral-300 font-medium">+2,000 patients booked</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Copy */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 mb-6 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Our Mission
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl text-white tracking-tighter font-medium mb-6 leading-[1.1]">
            We help clinics grow <br />
            <span className="font-serif italic text-blue-300">without the burnout.</span>
          </h2>

          <p className="text-lg leading-relaxed text-neutral-400 mb-10">
            We believe that healthcare providers should spend their time treating patients, not chasing phone calls. Our AI receptionist ensures every patient feels heard, instantly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                    <h4 className="text-white font-medium mb-1">Instant Response</h4>
                    <p className="text-sm text-neutral-500">Zero wait times.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h4 className="text-white font-medium mb-1">Human-Like</h4>
                    <p className="text-sm text-neutral-500">Natural voice.</p>
                </div>
             </div>
          </div>

          <button className="group inline-flex items-center gap-2 text-white font-medium hover:text-blue-300 transition-colors">
            Book a Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
