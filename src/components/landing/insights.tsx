import React from "react";
import Link from "next/link";

export function Insights() {
  return (
    <section id="blog" className="mt-24 md:mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
           
            <h2 className="mt-4 text-3xl sm:text-4xl font-geist tracking-tighter text-white">
              Build a healthier relationship with your agency workflow
            </h2>

            <p className="mt-2 max-w-xl text-sm sm:text-base font-geist text-slate-300">
              Proven strategies from agencies that scaled profitably. Learn how to automate client communication, capture more leads.
            </p>
          </div>

          <Link
            href="#"
            className="inline-flex items-center gap-2 text-xs font-medium font-geist text-slate-200 hover:text-white transition-colors"
          >
            View all articles
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <article className="group rounded-2xl border bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-4 transition-colors border-white/10 hover:border-blue-300/60">
            <div className="aspect-[16/10] overflow-hidden rounded-xl mb-4 bg-slate-900/60">
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
                alt="Team collaborating around laptops"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="text-[11px] uppercase tracking-wide mb-1 font-geist text-blue-300/80">
              Client Management
            </p>
            <h3 className="text-sm font-medium font-geist text-white group-hover:text-blue-100">
              Designing workflows for growth, not chaos
            </h3>
            <p className="mt-2 text-[12px] font-geist text-slate-300">
              Discover how top agencies streamline client onboarding, communication, and project delivery. Real strategies that reduce admin time by 60% while improving client satisfaction scores.
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-geist">8 min read</span>
              <span className="inline-flex items-center gap-1 font-geist group-hover:text-blue-200 transition-colors">
                Read
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </article>

          {/* Card 2 */}
          <article className="group rounded-2xl border bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-4 transition-colors border-white/10 hover:border-indigo-300/60">
            <div className="aspect-[16/10] overflow-hidden rounded-xl mb-4 bg-slate-900/60">
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/fb60cd45-faf4-43b0-b54d-431c435182ff_800w.webp"
                alt="Developer coding on multiple monitors"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="text-[11px] uppercase tracking-wide mb-1 font-geist text-indigo-300/80">
              Agency Future
            </p>
            <h3 className="text-sm font-medium group-hover:text-indigo-100 font-geist text-white">
              Why the next agency platform is an operating system for growth
            </h3>
            <p className="mt-2 text-[12px] font-geist text-slate-300">
              Your agency platform isn't just software—it's your competitive advantage. Learn how AI-powered tools are helping agencies scale from 5 to 50 clients without hiring more staff.
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-geist">12 min read</span>
              <span className="inline-flex items-center gap-1 group-hover:text-indigo-200 font-geist transition-colors">
                Read
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </article>

          {/* Card 3 */}
          <article className="group rounded-2xl border bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-4 transition-colors border-white/10 hover:border-purple-300/60">
            <div className="aspect-[16/10] overflow-hidden rounded-xl mb-4 bg-slate-900/60">
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3cea8e1d-29c5-4ec9-b423-09cfed74639e_800w.webp"
                alt="Person journaling with laptop"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="text-[11px] uppercase tracking-wide mb-1 font-geist text-purple-300/80">
              Automation
            </p>
            <h3 className="text-sm font-medium group-hover:text-purple-100 font-geist text-white">
              A smarter workflow: small changes, big gains
            </h3>
            <p className="mt-2 text-[12px] font-geist text-slate-300">
              Stop losing leads to voicemail and missed calls. See how agencies are automating lead qualification, appointment booking, and follow-ups to capture 3x more revenue after hours.
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-geist">6 min read</span>
              <span className="inline-flex items-center gap-1 group-hover:text-purple-200 font-geist transition-colors">
                Read
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

