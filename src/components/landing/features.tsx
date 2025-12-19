"use client";

import { MessageSquare, Calendar, Phone, Check } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="mb-16 flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-extralight text-white tracking-tight mb-4">
            Built for the <span className="font-serif italic opacity-80">flow</span> state.
          </h2>
          <p className="text-neutral-400 text-sm md:text-base">Designed to remove friction. Every pixel serves a purpose in your workflow.</p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-xs font-mono text-neutral-500 mb-1">SYSTEM STATUS</div>
          <div className="flex items-center justify-end gap-2 text-emerald-500 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            All Systems Operational
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
        
        {/* Card 1: AI Chatbot (Span 4) */}
        <div className="md:col-span-3 lg:col-span-4 glass rounded-3xl p-8 relative overflow-hidden group card-shine flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">AI Chatbot</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">24/7 Lead Capture. Never miss after-hours leads. Instantly qualifies and books appointments.</p>
          </div>
          <div className="absolute right-4 bottom-4 flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
             <div className="h-8 w-auto px-2 flex items-center justify-center rounded bg-neutral-800 border border-white/10 text-neutral-400 text-xs font-mono">24/7</div>
          </div>
        </div>

        {/* Card 2: Visual Automation (Span 8) */}
        <div className="md:col-span-3 lg:col-span-8 glass rounded-3xl p-0 relative overflow-hidden group card-shine">
          <div className="absolute inset-0 bg-grid opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="relative w-full h-full opacity-50 group-hover:opacity-100 transition-opacity duration-700">
               {/* Abstract Node Graph Visual Placeholder */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-600">
                  [Automation Graph Visual]
               </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background to-transparent z-10">
            <h3 className="text-xl font-medium text-white mb-2">Visual Automation</h3>
            <p className="text-sm text-neutral-400 max-w-md">Drag and drop to connect your tools. Trigger reminders from calendar events or follow-ups from missed calls.</p>
          </div>
        </div>

        {/* Card 3: Reminders (Span 6) */}
        <div className="md:col-span-6 lg:col-span-6 glass rounded-3xl p-8 relative overflow-hidden group card-shine flex flex-col justify-between h-[320px]">
          <div className="relative z-20">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
              </div>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Smart Reminders</h3>
            <p className="text-sm text-neutral-400">Automated SMS/email reminders with 1-click confirmation. Reduces no-shows from 18% to 4%.</p>
          </div>
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-tl-full"></div>
        </div>

        {/* Card 4: Voice Assistant (Span 6) */}
        <div className="md:col-span-6 lg:col-span-6 glass rounded-3xl relative overflow-hidden group card-shine h-[320px]">
          <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
             <span className="ml-2 text-[10px] font-mono text-neutral-500">voice_agent.ts</span>
          </div>
          <div className="p-8 mt-8 font-mono text-xs leading-relaxed text-neutral-400">
             <p><span className="text-purple-400">const</span> <span className="text-blue-400">call</span> = await agent.answer();</p>
             <p><span className="text-purple-400">if</span> (call.intent === <span className="text-green-400">'booking'</span>) {'{'}</p>
             <p className="pl-4">await calendar.book(slot);</p>
             <p className="pl-4">return <span className="text-green-400">"Confirmed"</span>;</p>
             <p>{'}'}</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-medium text-white">AI Voice Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium text-white border border-white/10">Coming Soon</span>
            </div>
            <p className="text-sm text-neutral-500">Answers phone calls 24/7 naturally.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
