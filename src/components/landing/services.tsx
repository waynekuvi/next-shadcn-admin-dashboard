"use client";

import Link from "next/link";

export function Services() {
  return (
    <section id="services" className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-indigo-950/5 to-background" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl font-extralight text-white tracking-tight mb-8">
                Your dedicated <span className="font-serif italic opacity-80 text-white-400">Client Portal.</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mb-12 text-lg">
                Give your clients a premium experience. A centralized hub for updates, files, and communication—branded for your agency.
            </p>
            
            <Link href="/auth/v2/login" className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-white-600 rounded-full transition-colors mb-16 group">
                Access Client Portal
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
            
            {/* Dashboard Preview with 3D Tilt Effect */}
            <div className="w-full max-w-5xl relative mt-8 mb-0 perspective-[2000px] group">
                {/* Glow Behind */}
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                
                {/* Main Dashboard Image */}
                <div className="relative transform transition-all duration-700 group-hover:rotate-x-2 group-hover:-translate-y-4">
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F0F11] relative">
                        {/* MacOS Window Header */}
                        <div className="h-11 bg-[#1c1c1e]/80 backdrop-blur-md flex items-center px-4 border-b border-white/5 w-full absolute top-0 left-0 z-20">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dba536]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aa032]"></div>
                            </div>
                        </div>
                        
                        {/* Add padding-top to image to account for header */}
                        <div className="pt-11 bg-[#0F0F11]">
                            <img 
                                src="https://res.cloudinary.com/dwjvtgiid/image/upload/v1764790803/Screenshot_2025-12-03_at_19.39.14_hcm6gd.png" 
                                alt="Client Portal Dashboard" 
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
