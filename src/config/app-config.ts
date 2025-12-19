import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Atliso Digital Solutions",
  version: packageJson.version,
  copyright: `© ${currentYear}, Atliso Digital Solutions.`,
  meta: {
    title: "Atliso Digital Solutions - AI Buiness Automation Platform",
    description:
      "Atliso Digital Solutions automates service businesses with AI. We build intelligent systems that capture leads, reduce no-shows, and deliver consistent revenue—so you can focus on what you do best. Done-for-you automation that just works.",
  },
};
