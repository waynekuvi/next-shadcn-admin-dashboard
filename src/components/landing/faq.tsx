"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How long does the setup take?",
    answer: "We can get your practice automated in as little as 48 hours. We handle the integration with your existing practice management software (Dentally, SOE, CareStack, etc.) so you don't have to lift a finger."
  },
  {
    question: "Does it replace my receptionist?",
    answer: "No, it supercharges them. Atliso handles the repetitive tasks (confirmations, FAQs, after-hours booking) so your staff can focus on the patients in front of them and high-value complex cases."
  },
  {
    question: "Is it GDPR compliant?",
    answer: "Absolutely. We use bank-grade encryption and adhere to strict GDPR and HIPAA guidelines to ensure all patient data is secure and private."
  },
  {
    question: "What happens if the AI doesn't know the answer?",
    answer: "The AI is trained on your specific practice details. If it encounters a complex query it can't resolve, it gracefully hands the conversation over to your human team with a full transcript."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
           <span className="font-serif italic opacity-80 text-3xl md:text-5xl font-extralight text-gray-400 tracking-tight mb-4 inline-block">
             Common Questions
           </span>
          <p className="text-neutral-400 mt-4 text-sm md:text-base">
            Everything you need to know about automating your practice.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-6 text-left group"
              >
                <span className="text-white font-medium text-sm md:text-base pr-8">{faq.question}</span>
                <span className="text-neutral-500 group-hover:text-white transition-colors flex-shrink-0">
                  {openIndex === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-neutral-400 leading-relaxed text-sm md:text-[15px]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
