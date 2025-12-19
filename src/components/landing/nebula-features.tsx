"use client";

import { motion } from "framer-motion";
import { Zap, Shield, BarChart3, Users, Code2, Globe } from "lucide-react";

export function NebulaFeatures() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-20 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-white mb-6">
            Everything you need to <br />
            <span className="text-blue-400">scale your business.</span>
          </h2>
          <p className="text-lg text-neutral-400">
            Powerful features designed to automate your workflows and help you focus on what matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-[32px] border border-white/10 bg-white/5 p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:opacity-40 transition-opacity">
               <Zap className="w-64 h-64 text-blue-500" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="mb-8">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 mb-6 ring-1 ring-blue-500/30">
                   <Zap className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-medium text-white mb-4">Instant Automation</h3>
                 <p className="text-neutral-400 max-w-sm leading-relaxed">
                   Connect your favorite tools and automate repetitive tasks in seconds. No coding required.
                 </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-16 bg-white/10 rounded" />
                  </div>
                  <div className="text-xs text-green-400 font-mono">ACTIVE</div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/5 rounded" />
                  <div className="h-1.5 w-full bg-white/5 rounded" />
                  <div className="h-1.5 w-3/4 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mb-6 ring-1 ring-purple-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Enterprise Security</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Bank-grade encryption and SOC2 compliance out of the box.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:bg-white/10 transition-colors">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 mb-6 ring-1 ring-rose-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Real-time Analytics</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Track performance and ROI with beautiful, real-time dashboards.
            </p>
          </div>

          {/* Card 4 (Wide) */}
          <div className="col-span-1 md:col-span-3 rounded-[32px] border border-white/10 bg-white/5 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group">
             <div className="flex-1">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mb-6 ring-1 ring-amber-500/30">
                 <Globe className="w-6 h-6" />
               </div>
               <h3 className="text-3xl font-medium text-white mb-4">Global Infrastructure</h3>
               <p className="text-neutral-400 max-w-lg leading-relaxed mb-8">
                 Deploy your agents to edge locations worldwide for lowest latency. Our intelligent routing system ensures your customers always get the fastest response.
               </p>
               <div className="flex gap-4">
                 <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300">
                   <span className="block text-xl font-semibold text-white mb-1">99.9%</span>
                   Uptime
                 </div>
                 <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300">
                   <span className="block text-xl font-semibold text-white mb-1">50ms</span>
                   Latency
                 </div>
               </div>
             </div>
             <div className="w-full md:w-1/2 aspect-video rounded-2xl bg-black/50 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />
                <img 
                   src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d25a1767-0ea8-4aac-b981-6afd67dc79a6_800w.webp" 
                   alt="Map"
                   className="w-full h-full object-cover opacity-60 mix-blend-screen"
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

