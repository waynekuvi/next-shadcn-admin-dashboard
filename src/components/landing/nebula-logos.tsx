"use client";

import { motion } from "framer-motion";

const companies = [
  { name: "Intercom", logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Intercom_logo.svg" },
  { name: "Descript", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Descript_logo.svg" },
  { name: "Notion", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
  { name: "Grammarly", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Grammarly_logo.svg" },
  { name: "Linear", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Linear_logo.svg" },
  { name: "Retool", logo: "https://upload.wikimedia.org/wikipedia/en/e/e4/Retool_logo.png" },
];

export function NebulaLogos() {
  return (
    <section className="py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-medium text-neutral-500 mb-8 uppercase tracking-widest">
          Trusted by the best teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Placeholder SVGs for logos since external links might break or look inconsistent */}
           {/* Replacing with text/simple placeholders for robustness */}
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-white rounded-full"></div>
             <span className="text-xl font-semibold text-white">Acme</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-white rounded-full"></div>
             <span className="text-xl font-semibold text-white">Quantum</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-white rounded-full"></div>
             <span className="text-xl font-semibold text-white">Echo</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-white rounded-full"></div>
             <span className="text-xl font-semibold text-white">Nebula</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-white rounded-full"></div>
             <span className="text-xl font-semibold text-white">Fox</span>
           </div>
        </div>
      </div>
    </section>
  );
}

