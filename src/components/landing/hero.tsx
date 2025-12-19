"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Command, CheckCircle, Circle, Clock, Github, Slack, Mail, Figma } from "lucide-react";

export function Hero() {
  return (
    <section id="hero" className="relative z-10 flex flex-col items-center pt-32 pb-20 px-4 text-center max-w-[90rem] mx-auto overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background blur-[100px] opacity-50 -z-10" />
      <div className="bg-grid absolute inset-0 opacity-60 -z-10" />

      {/* Status Badge */}
      <div className="animate-fade-up delay-100 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-neutral-300 tracking-wide uppercase">
            AI Voice Agent Live
            </span>
        </div>
          </div>

      {/* Main Heading */}
      <h1 className="animate-fade-up delay-200 text-5xl md:text-7xl lg:text-8xl font-extralight text-white tracking-tighter leading-[0.95] mb-8">
        Your receptionist <br />
        <span className="font-serif italic text-neutral-400 opacity-80 font-light pr-2">that never sleeps.</span>
          </h1>

      <p className="animate-fade-up delay-300 text-base md:text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed mb-10 font-light">
        A unified voice interface for your clinic. Handle calls, qualify patients, and fill your calendar with 24/7 precision.
      </p>

      {/* Command Bar Visual */}
      <div className="animate-fade-up delay-500 relative w-full max-w-3xl mx-auto perspective-[2000px] group mb-24">
        {/* Floating Command Palette */}
        <div className="relative bg-[#0F0F11] rounded-xl border border-white/10 shadow-2xl overflow-hidden transform transition-all duration-700 group-hover:rotate-x-2 group-hover:-translate-y-2 text-left">
          
          {/* Header (Search) */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <Search className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-500 font-mono">What would you like to do?</span>
            <div className="ml-auto flex gap-2">
              <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded border border-white/10 bg-white/5 font-mono text-[10px] text-neutral-500">⌘ K</kbd>
            </div>
          </div>

          {/* Results List */}
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 group transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-4 h-4" />
            </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-white group-hover:text-indigo-200 transition-colors">Book Appointment</span>
                <span className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    New Patient • Tomorrow 2:00 PM
                </span>
            </div>
              <span className="ml-auto text-[10px] text-neutral-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">↵</span>
            </div>
            
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group/item border border-transparent hover:border-white/5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover/item:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-neutral-300 group-hover/item:text-white transition-colors">Check Schedule</span>
                <span className="text-[10px] text-neutral-600">Dr. Miller • 3 slots open</span>
            </div>
          </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group/item border border-transparent hover:border-white/5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 group-hover/item:scale-110 transition-transform relative">
                <Circle className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-neutral-300 group-hover/item:text-white transition-colors">Reschedule Call</span>
                <span className="text-[10px] text-neutral-600">Incoming from +44 7700...</span>
              </div>
            </div>
          </div>

          {/* Subtle Glow behind */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-indigo-500/20 blur-[80px]" />
              </div>

        {/* Background Elements floating */}
        <div className="absolute right-0 bottom-10 w-32 h-16 rounded-xl border border-white/5 bg-[#0F0F11]/80 backdrop-blur-md p-3 animate-float flex items-center gap-3" style={{ animationDelay: '2s' }}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-neutral-400">Syncing...</span>
              </div>
            </div>

      {/* Infinite Marquee of Integrations */}
      <div className="w-full max-w-6xl mx-auto overflow-hidden mask-linear-fade relative opacity-40 hover:opacity-80 transition-opacity duration-500">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex gap-12 animate-marquee w-max">
          {/* Repeating Icons */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12">
              <span className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
                <Github className="w-5 h-5" /> GitHub
              </span>
              <span className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
                <Slack className="w-5 h-5" /> Slack
              </span>
              <span className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0l12 12-12 12L0 12z"/></svg> Notion
              </span>
              <span className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg> Linear
              </span>
              <span className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
                <Mail className="w-5 h-5" /> Gmail
              </span>
              <span className="text-lg font-semibold text-neutral-600 flex items-center gap-2">
                <img 
                  src="https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg" 
                  alt="Brand Logo" 
                  className="w-5 h-5"
                /> Atliso
              </span>
            </div>
          ))}
          </div>
      </div>
    </section>
  );
}
