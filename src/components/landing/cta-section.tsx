"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black to-indigo-950/30" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to Amplify Your Profits?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join 25+ UK dental practices saving thousands every month. Setup takes just 48 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-14 text-lg">
              <Link href="/auth/v2/login">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-full px-8 h-14 text-lg">
              <Link href="/auth/v2/login">
                View Demo
              </Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-zinc-500">
            No credit card required for demo • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

