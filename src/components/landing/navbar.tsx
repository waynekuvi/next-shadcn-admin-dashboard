"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle smooth scroll if we're on the landing page
    if (pathname === "/" && href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80; // Account for fixed navbar height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="https://res.cloudinary.com/dwjvtgiid/image/upload/v1764419666/logo-white_x64htk.svg" 
            alt="Atliso Logo" 
            className="w-6 h-6" 
          />
          <span className="text-sm font-medium tracking-tight text-white">Atliso</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-400 ml-12">
          <Link 
            href="#how-it-works" 
            onClick={(e) => handleNavClick(e, "#how-it-works")}
            className="hover:text-white transition-colors"
          >
            Product
          </Link>
          <Link 
            href="#testimonials" 
            onClick={(e) => handleNavClick(e, "#testimonials")}
            className="hover:text-white transition-colors"
          >
            Testimonials
          </Link>
          <Link 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, "#pricing")}
            className="hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link 
            href="#faq" 
            onClick={(e) => handleNavClick(e, "#faq")}
            className="hover:text-white transition-colors"
          >
            FAQs
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/v2/login" className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors px-2">
            Log in
          </Link>
          <button className="group relative px-4 py-1.5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-neutral-200 transition-all overflow-hidden">
            <span className="relative z-10"> Start your project</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[beam_1s_infinite]" />
          </button>
        </div>
      </div>
    </nav>
  );
}
