"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

export function NebulaHero() {
  return (
    <section className="relative z-10 pt-32 pb-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-fit mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur-md transition-colors hover:bg-white/10">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-500/10 text-blue-400 px-2 py-0.5 ring-1 ring-blue-500/20">
              New Feature
            </span>
            <span className="font-medium">AI Agent Workflow Builder</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-medium tracking-tighter text-white mb-6">
            Automate work, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600">
              amplify growth.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-400 leading-relaxed">
            Atliso helps ambitious service businesses capture more leads, reduce no-shows, and save thousands—without hiring more staff.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-20"
        >
          <button className="inline-flex h-12 items-center gap-2 rounded-full bg-white text-black px-8 text-sm font-medium hover:bg-neutral-200 transition-colors">
            Start for free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 text-white px-8 text-sm font-medium hover:bg-white/10 transition-colors backdrop-blur-sm">
            <PlayCircle className="w-4 h-4" />
            Watch Demo
          </button>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl"
        >
          <div className="rounded-[24px] overflow-hidden border border-white/10 bg-[#0A0A0B] shadow-2xl">
            <img 
              src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/357cb3d1-9f65-4810-884b-f0072a65193d_1600w.webp" 
              alt="Atliso Dashboard" 
              className="w-full h-auto opacity-90"
            />
          </div>
          
          {/* Glow effects */}
          <div className="absolute -top-40 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10" />
          <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -z-10" />
        </motion.div>

      </div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
    </section>
  );
}

