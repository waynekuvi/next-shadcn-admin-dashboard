"use client";

import { Keyboard, Box, Shield, Code, Phone, MessageSquare, Bell } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto relative">
        {/* Section Header */}
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
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    All Systems Operational
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
            
            {/* Card 1: Voice AI Receptionist (Span 4) */}
            <div className="md:col-span-3 lg:col-span-4 glass rounded-3xl p-8 relative overflow-hidden group card-shine flex flex-col justify-between">
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white">
                        <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Voice AI Receptionist</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">Never miss a call. AI handles inquiries, qualifies leads, and books appointments 24/7.</p>
                </div>
                
                {/* Visual: Incoming Call UI */}
                <div className="absolute right-4 bottom-4 flex gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                   <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                     <Phone className="w-4 h-4 text-red-400 rotate-[135deg]" />
                   </div>
                   <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 animate-pulse">
                     <Phone className="w-4 h-4 text-green-400" />
                   </div>
                </div>
            </div>

            {/* Card 2: Chatbot Support AI (Span 8) */}
            <div className="md:col-span-3 lg:col-span-8 glass rounded-3xl p-0 relative overflow-hidden group card-shine">
                <div className="absolute inset-0 bg-grid opacity-20" />
                
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    {/* Chatbot Interaction Visual */}
                    <div className="relative w-full h-full p-8 flex flex-col gap-3 justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="flex items-start gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shrink-0">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 border border-white/5 text-xs text-neutral-300">
                                How can I help you today?
                            </div>
                        </div>
                        <div className="flex items-start gap-3 max-w-[80%] self-end flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-400 border border-white/10 shrink-0">
                                <span className="text-[10px]">U</span>
                            </div>
                            <div className="bg-blue-500/10 rounded-2xl rounded-tr-none p-3 border border-blue-500/20 text-xs text-blue-100">
                                I'd like to book a consultation.
                            </div>
                        </div>
                        <div className="flex items-start gap-3 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shrink-0">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 border border-white/5 text-xs text-neutral-300 flex gap-1 items-center">
                                <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                                <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                                <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background to-transparent z-10">
                    <h3 className="text-xl font-medium text-white mb-2">Chatbot Support AI</h3>
                    <p className="text-sm text-neutral-400 max-w-md">Intelligent conversations that feel human. Instantly answer queries and capture leads.</p>
                </div>
            </div>

            {/* Card 3: SMS Reminders (Span 6) */}
            <div className="md:col-span-6 lg:col-span-6 glass rounded-3xl p-8 relative overflow-hidden group card-shine flex flex-col justify-between h-[320px]">
                <div className="relative z-20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono">
                            SENT
                        </div>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Smart SMS Reminders</h3>
                    <p className="text-sm text-neutral-400">Reduce no-shows automatically. Professional reminders sent at the perfect time.</p>
                </div>
                
                {/* Visual: SMS Bubble */}
                <div className="absolute inset-x-8 bottom-8">
                    <div className="bg-neutral-900/90 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] text-neutral-500 font-mono">MESSAGES • NOW</span>
                        </div>
                        <p className="text-sm text-white font-medium">Hi Sarah, just a reminder for your appointment with Dr. Miller tomorrow at 2:00 PM.</p>
                        <p className="text-xs text-neutral-500 mt-1">Reply C to confirm.</p>
                    </div>
                </div>
            </div>

            {/* Card 4: Developer API (Span 6) */}
            <div className="md:col-span-6 lg:col-span-6 glass rounded-3xl relative overflow-hidden group card-shine h-[320px]">
                <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    <span className="ml-2 text-[10px] font-mono text-neutral-500">atliso-config.ts</span>
                </div>
                <div className="p-8 mt-8 font-mono text-xs leading-relaxed text-neutral-400">
                    <p><span className="text-purple-400">import</span> {"{"} Atliso {"}"} <span className="text-purple-400">from</span> <span className="text-green-400">'@atliso/sdk'</span>;</p>
                    <p className="h-4"></p>
                    <p><span className="text-purple-400">const</span> client = <span className="text-blue-400">new</span> Atliso({"{"}</p>
                    <p className="pl-4">apiKey: <span className="text-green-400">process.env.ATLISO_KEY</span>,</p>
                    <p className="pl-4">modules: [<span className="text-green-400">'voice'</span>, <span className="text-green-400">'sms'</span>, <span className="text-green-400">'chat'</span>]</p>
                    <p>{"}"});</p>
                    <p className="h-4"></p>
                    <p><span className="text-neutral-500">// Initialize AI Receptionist</span></p>
                    <p><span className="text-blue-400">await</span> client.voice.connect();</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent">
                    <h3 className="text-lg font-medium text-white">Atliso API</h3>
                    <p className="text-sm text-neutral-500">Seamless integration with your existing stack.</p>
                </div>
            </div>

        </div>
    </section>
  );
}
