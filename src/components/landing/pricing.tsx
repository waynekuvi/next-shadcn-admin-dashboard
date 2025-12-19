"use client";

import { useState } from "react";
import { Check, Info, Zap, LayoutGrid, Hexagon } from "lucide-react";
import { BookingModal } from "./booking-modal";

export function Pricing() {
  // Pinnacle slider state
  // 5 nodes: 0, 1, 2, 3, 4
  // Price Range: £600 - £1,200
  const [pinnacleStep, setPinnacleStep] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const pinnacleTiers = [
    { price: 600, credits: 3000, tasks: "3,000" },
    { price: 750, credits: 5000, tasks: "5,000" },
    { price: 900, credits: 10000, tasks: "10,000" },
    { price: 1050, credits: 20000, tasks: "20,000" },
    { price: 1200, credits: 30000, tasks: "30,000" },
  ];

  const currentPinnacle = pinnacleTiers[pinnacleStep];
  const pinnacleProgress = (pinnacleStep / 4) * 100;

  return (
    <section id="pricing" className="py-24 relative">
      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extralight text-white tracking-tight mb-4">
            Simple pricing, <span className="font-serif italic opacity-80 text-neutral-300">transparent value.</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Choose the plan that fits your stage. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: Website Design */}
          <div className="rounded-[32px] bg-white p-6 sm:p-8 flex flex-col relative group transition-transform hover:scale-[1.01] duration-300 max-w-[400px] mx-auto w-full h-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-medium text-black" style={{ fontFamily: 'Satoshi, sans-serif' }}>Website Design</h3>
            </div>
            
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-[16px] bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <LayoutGrid className="w-6 h-6 text-[#0080ff]" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-normal text-black tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>£3,500</span>
                  <span className="text-[14px] text-neutral-500 font-medium">one-time</span>
                </div>
            </div>

              <p className="text-[14px] leading-relaxed text-[#595959] mb-8 h-10 font-medium">
                Complete website overhaul for growing businesses.
              </p>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  { text: "Custom UX/UI Design", info: true },
                  { text: "SEO Optimization", info: true },
                  { text: "Speed & Performance Tuning", info: true },
                  { text: "Mobile Responsive", info: true },
                  { text: "Conversion Focused Layout", info: true },
                  { text: "Advanced Analytics Setup", info: true },
                  { text: "CMS Integration", info: true },
                  { text: "2 Weeks Post-Launch Support", info: true },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center justify-between text-[12px] font-medium text-[#9ba1a5]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#9ba1a5]" />
                      </div>
                      <span>{feature.text}</span>
                  </div>
                    {feature.info && <Info className="w-3.5 h-3.5 text-[#9ba1a5] hover:text-neutral-500 transition-colors cursor-help" />}
                </div>
              ))}
            </div>

              <button 
                onClick={() => setIsBookingOpen(true)}
                className="w-full mt-auto py-3.5 rounded-full text-white font-medium text-[14px] transition-all hover:shadow-lg active:scale-[0.99]" 
                style={{ background: 'linear-gradient(180deg, #666666 0%, #000000 100%)', boxShadow: '0px 1px 15px rgba(0,0,0,0.1)' }}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Card 2: Business Automation (Dynamic) */}
          <div className="rounded-[32px] bg-[#0A0A0A] border border-white/5 p-6 sm:p-8 flex flex-col relative group transition-transform hover:scale-[1.01] duration-300 shadow-2xl shadow-black/50 max-w-[400px] mx-auto w-full h-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-medium text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>Business Automation</h3>
                <span className="px-3 py-1 rounded-full bg-[#0080ff] text-white text-[12px] font-medium tracking-wide">
                  Popular
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-normal text-white tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    £{currentPinnacle.price.toLocaleString()}
                  </span>
                  <span className="text-[14px] text-neutral-400 font-medium">/month</span>
                </div>
            </div>
            
              <p className="text-[14px] leading-relaxed text-[#cccccc] mb-8 h-10 font-medium">
                Scalable automation solutions for your operations.
              </p>

              {/* Slider/Credits */}
              <div className="mb-8 relative">
                {/* Hidden input range for interaction */}
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  step="1"
                  value={pinnacleStep}
                  onChange={(e) => setPinnacleStep(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                />
                
                {/* Track Container */}
                <div className="h-6 w-full relative mb-4 flex items-center">
                  {/* Nodes (Background Layer) */}
                  <div className="absolute inset-0 px-[4px] flex justify-between items-center pointer-events-none z-0">
                    {[0, 1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                          step <= pinnacleStep ? "bg-[#0080ff]" : "bg-[#33373a]"
                        }`}
                      />
                    ))}
            </div>

                   {/* Connecting Line (Track) */}
                  <div className="absolute inset-0 px-[9px] flex items-center pointer-events-none z-0">
                     <div className="h-[6px] w-full bg-[#33373a] rounded-full relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#0080ff] to-[#33373a] transition-all duration-150 ease-out"
                          style={{ width: `calc(3px + (100% - 6px) * ${pinnacleStep / 4})` }}
                        />
                     </div>
                  </div>

                   {/* Thumb */}
                   <div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[4px] border-[#0080ff] rounded-full shadow-lg shadow-blue-500/20 z-10 transition-all duration-150 ease-out pointer-events-none"
                    style={{ left: `calc((100% - 24px) * ${pinnacleStep / 4})` }}
                   ></div>
                </div>

                <div className="flex items-center gap-2 text-[14px] font-semibold text-white">
                  <Hexagon className="w-3.5 h-3.5 text-black fill-black invert" />
                  {currentPinnacle.credits.toLocaleString()} Credits
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  { text: `Tasks: up to ${currentPinnacle.tasks} per month`, info: true },
                  { text: "24/7 AI Voice Receptionist", info: true },
                  { text: "Custom Workflow Automation", info: true },
                  { text: "CRM Integration Updates", info: true },
                  { text: "Priority Support", info: true },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center justify-between text-[12px] font-medium text-[#9ba1a5]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span>{feature.text}</span>
                    </div>
                    {feature.info && <Info className="w-3.5 h-3.5 text-[#9ba1a5] hover:text-neutral-500 transition-colors cursor-help" />}
                </div>
              ))}
            </div>

              <button 
                onClick={() => setIsBookingOpen(true)}
                className="w-full mt-auto py-3.5 rounded-full text-[#333333] font-medium text-[14px] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.99] border border-black/5" 
                style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #A1A1A1 100%)' }}
              >
                Get Started
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
