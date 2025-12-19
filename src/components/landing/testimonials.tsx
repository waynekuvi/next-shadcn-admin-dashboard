"use client";

import React from "react";
import { MessageCircle, Repeat2, Heart, BadgeCheck } from "lucide-react";

interface Testimonial {
  name: string;
  handle: string;
  verified: boolean;
  avatar: string;
  time: string;
  text: string;
  stats: {
    replies: number;
    retweets: number;
    likes: number;
  };
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Dr. Sarah Williams",
    handle: "@DrSarahDental",
    verified: true,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    time: "3h",
    text: "The chatbot captured 4 emergency cases last night while I was sleeping. That's £600 in revenue I would've lost to competitors. @Atliso is paying for itself 15x over.",
    stats: { replies: 12, retweets: 34, likes: 156 },
  },
  {
    name: "James Patterson",
    handle: "@JamesPConsulting",
    verified: true,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "1d",
    text: "Setup took 2 days. First week we got 18 qualified leads. Our old contact form got maybe 3 per month. The lead scoring alone is worth the subscription. @Atliso",
    stats: { replies: 8, retweets: 21, likes: 89 },
  },
  {
    name: "Sophie Chen",
    handle: "@SophieSpaOwner",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    time: "6h",
    text: "No-shows dropped from 22% to 3% in a month. That's real money back in my pocket. The automated reminders just work. @Atliso was the best business decision I made this year.",
    stats: { replies: 15, retweets: 28, likes: 142 },
  },
  {
    name: "Michael Roberts",
    handle: "@MikeRobertsUK",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    time: "2d",
    text: "I was skeptical about AI chatbots. Then I saw it book 3 appointments at 11pm on a Tuesday. Now I'm a believer. @Atliso crushed my doubts.",
    stats: { replies: 6, retweets: 19, likes: 73 },
  },
  {
    name: "Emma Davies",
    handle: "@EmmaHealthClinic",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/24.jpg",
    time: "5h",
    text: "Our receptionist used to spend 2 hours daily on reminder calls. Now that time goes to patient care. @Atliso boosted staff morale and kept patients happier. Win-win.",
    stats: { replies: 9, retweets: 24, likes: 98 },
  },
  {
    name: "Tom Wilson",
    handle: "@TomWilsonDDS",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    time: "4d",
    text: "The ROI dashboard is incredible. I can literally watch money being saved in real-time. Showed it to my business partner and he was speechless. @Atliso is a game changer.",
    stats: { replies: 7, retweets: 16, likes: 64 },
  },
  {
    name: "Lisa Martinez",
    handle: "@LisaMBeauty",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/79.jpg",
    time: "12h",
    text: "Last-minute cancellations used to kill my schedule. The 2-hour reminder gets people to show up. My calendar is finally full and profitable thanks to @Atliso.",
    stats: { replies: 11, retweets: 31, likes: 127 },
  },
  {
    name: "David Thompson",
    handle: "@DavidTConsults",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    time: "8h",
    text: "After-hours leads were going straight to voicemail. Now the @Atliso chatbot handles them instantly. Closed 2 high-value clients from 9pm inquiries last week.",
    stats: { replies: 5, retweets: 18, likes: 71 },
  },
  {
    name: "Rachel Green",
    handle: "@RachelGDental",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    time: "1d",
    text: "The @Atliso lead scoring is scary accurate. It flags the serious buyers and filters the tire-kickers. My team only talks to people ready to book now.",
    stats: { replies: 14, retweets: 29, likes: 118 },
  },
  {
    name: "Chris Anderson",
    handle: "@ChrisAndersonPT",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    time: "3d",
    text: "I tried building this myself with Zapier. Gave up after 3 weeks. @Atliso did it in 48 hours and it actually works. Worth every penny.",
    stats: { replies: 8, retweets: 22, likes: 86 },
  },
  {
    name: "Olivia Taylor",
    handle: "@OliviaTSalon",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    time: "2h",
    text: "The @Atliso chatbot feels more helpful than some receptionists I've hired. It's polite, fast, and never takes a day off. My clients love it.",
    stats: { replies: 10, retweets: 26, likes: 104 },
  },
  {
    name: "Ben Morrison",
    handle: "@BenMLegal",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    time: "6d",
    text: "Client intake used to take 3 back-and-forth emails. Now it's handled in one conversation. Consultation bookings are up 40% with @Atliso. Simple as that.",
    stats: { replies: 6, retweets: 17, likes: 68 },
  },
  {
    name: "Hannah Brooks",
    handle: "@HannahBPhysio",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    time: "4h",
    text: "I was manually following up with leads in a spreadsheet. Now @Atliso does it automatically. Freed up 6 hours per week. Those hours = more patients treated.",
    stats: { replies: 13, retweets: 30, likes: 135 },
  },
  {
    name: "Marcus Johnson",
    handle: "@MarcusJClinic",
    verified: false,
    avatar: "https://randomuser.me/api/portraits/men/92.jpg",
    time: "1d",
    text: "The @Atliso after-hours chatbot captured an implant consultation worth £8,000. It paid for a year of subscription in one lead. Absolutely wild.",
    stats: { replies: 9, retweets: 25, likes: 112 },
  },
];

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#71767B] fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  // Function to highlight @Atliso in the text
  const renderText = (text: string) => {
    const parts = text.split(/(@Atliso)/g);
    return parts.map((part, index) =>
      part === "@Atliso" ? (
        <span key={index} className="text-[#1D9BF0] cursor-pointer hover:underline">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div className="w-[340px] md:w-[380px] min-h-[140px] bg-[#18181b] rounded-xl p-5 border border-white/10 flex flex-col justify-between flex-shrink-0">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-3">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[15px] text-white hover:underline cursor-pointer">
                  {testimonial.name}
                </span>
                {testimonial.verified && (
                  <BadgeCheck className="w-4 h-4 text-[#1D9BF0] fill-[#1D9BF0] text-white" />
                )}
              </div>
              <div className="text-[#71767B] text-[14px] flex items-center gap-1">
                <span>{testimonial.handle}</span>
                <span>·</span>
                <span>{testimonial.time}</span>
              </div>
            </div>
          </div>
          <XIcon />
        </div>
        
        <p className="text-[#e5e7eb] text-[15px] leading-relaxed mb-4">
          {renderText(testimonial.text)}
        </p>
      </div>

      <div className="flex items-center justify-between text-[#71767B] max-w-[85%]">
        <button className="flex items-center gap-1.5 group hover:text-[#1D9BF0] transition-colors">
          <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-[#1D9BF0]/10 transition-colors">
            <MessageCircle className="w-[14px] h-[14px]" />
          </div>
          <span className="text-[13px] font-medium">{testimonial.stats.replies}</span>
        </button>
        <button className="flex items-center gap-1.5 group hover:text-[#00BA7C] transition-colors">
          <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-[#00BA7C]/10 transition-colors">
            <Repeat2 className="w-[14px] h-[14px]" />
          </div>
          <span className="text-[13px] font-medium">{testimonial.stats.retweets}</span>
        </button>
        <button className="flex items-center gap-1.5 group hover:text-[#F91880] transition-colors">
          <div className="p-1.5 -ml-1.5 rounded-full group-hover:bg-[#F91880]/10 transition-colors">
            <Heart className="w-[14px] h-[14px]" />
          </div>
          <span className="text-[13px] font-medium">{testimonial.stats.likes}</span>
        </button>
      </div>
    </div>
  );
};

export function Testimonials() {
  // Split testimonials into two rows
  const topRow = TESTIMONIALS.slice(0, 7);
  const bottomRow = TESTIMONIALS.slice(7, 14);

  return (
    <section id="testimonials" className="py-24 bg-black border-t border-b border-white/5 overflow-hidden">
      <style jsx>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
          will-change: transform;
        }
        .animate-scroll-right {
          animation: scroll-right 60s linear infinite;
          will-change: transform;
        }
        .animate-scroll-left:hover, .animate-scroll-right:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-left, .animate-scroll-right {
            animation: none;
          }
        }
      `}</style>
      
      {/* Header - Contained width */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-12">
        <div className="header text-center">
          <span className="font-serif italic opacity-80 text-3xl md:text-5xl font-extralight text-gray-400 tracking-tight mb-8 inline-block">
            Community Feedback
          </span>
                    </div>
                </div>
                
      {/* Mobile View: Stacked (Keeping as requested in previous interaction, but aligned with new header style) */}
      <div className="md:hidden flex flex-col gap-4 px-6 max-w-[1200px] mx-auto">
        {TESTIMONIALS.slice(0, 4).map((testimonial) => (
          <div key={testimonial.handle} className="w-full" suppressHydrationWarning>
            <TestimonialCard testimonial={testimonial} />
                    </div>
        ))}
        <div className="text-center mt-4">
          <p className="text-neutral-500 text-sm">Scroll for more...</p>
                    </div>
                </div>

      {/* Desktop View: Marquee - Full width with fades */}
      <div className="hidden md:block carousel-wrapper relative w-full mt-12">
        {/* Left fade overlay */}
        <div 
          className="absolute top-0 left-0 w-[80px] md:w-[200px] h-full z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
        
        {/* Right fade overlay */}
        <div 
          className="absolute top-0 right-0 w-[80px] md:w-[200px] h-full z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
        
        <div className="carousel-container flex flex-col gap-6">
          {/* Top Row - Scroll Left */}
          <div className="flex gap-4 w-max animate-scroll-left">
            {/* Original Set */}
            {topRow.map((testimonial) => (
              <TestimonialCard key={`top-orig-${testimonial.handle}`} testimonial={testimonial} />
            ))}
            {/* Duplicate Set for Loop */}
            {topRow.map((testimonial) => (
              <TestimonialCard key={`top-dup-${testimonial.handle}`} testimonial={testimonial} />
            ))}
                </div>

          {/* Bottom Row - Scroll Right */}
          <div className="flex gap-4 w-max animate-scroll-right">
            {/* Original Set */}
            {bottomRow.map((testimonial) => (
              <TestimonialCard key={`bottom-orig-${testimonial.handle}`} testimonial={testimonial} />
            ))}
            {/* Duplicate Set for Loop */}
            {bottomRow.map((testimonial) => (
              <TestimonialCard key={`bottom-dup-${testimonial.handle}`} testimonial={testimonial} />
            ))}
          </div>
            </div>
        </div>
    </section>
  );
}
