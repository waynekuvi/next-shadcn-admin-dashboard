"use client";

import Link from "next/link";
import { useState } from "react";
import { BookingModal } from "./booking-modal";

export function Footer() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <footer className="relative pt-32 pb-12 bg-[#050505] overflow-hidden">
        {/* Booking Modal */}
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

        {/* Background Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* CTA Container with Wood Background */}
            <div className="relative mb-24 rounded-[32px] overflow-hidden p-12 md:p-20 text-center border border-white/10 shadow-2xl">
                {/* Wood Texture Background */}
                <div 
                    className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: `url('https://res.cloudinary.com/dwjvtgiid/image/upload/v1764847043/black-wood_bg_p5qj3z.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'contrast(1.2) brightness(0.8)'
                    }}
                />
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-neutral-900/80 to-black/90" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-4xl md:text-6xl font-extralight text-white tracking-tight mb-8">
                    Ready to <span className="font-serif italic opacity-80">focus?</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button 
                          onClick={() => setIsBookingOpen(true)}
                          className="group relative h-12 px-8 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        >
                            <span className="relative z-10">Book Demo</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[beam_0.5s_infinite]" />
                    </button>
                        <Link 
                          href="/auth/v2/login"
                          className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-neutral-300 font-medium text-sm hover:text-white hover:bg-white/10 transition-all"
                        >
                            Client Portal
                        </Link>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between gap-8">
                <div className="flex items-center gap-2">
                        <img 
                          src="https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg" 
                          alt="Atliso Logo" 
                      className="w-6 h-6" 
                        />
                    <span className="text-xs text-neutral-600">© 2025 Atliso Digital Solutions.</span>
                </div>
                
                <div className="flex gap-8 text-xs text-neutral-500 font-medium">
                    <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                    <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
                    <Link href="#" className="hover:text-white transition-colors">Discord</Link>
                    <Link href="#" className="hover:text-white transition-colors">Legal</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}
