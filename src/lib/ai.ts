
// Simple mock AI service for MVP
// In production, this would call OpenAI/Anthropic

interface AIAnalysisResult {
  score: number;
  category: string;
  summary?: string;
}

export async function analyzeLead(data: { name: string; email: string; message?: string }): Promise<AIAnalysisResult> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const emailDomain = data.email.split("@")[1]?.toLowerCase();
  
  // Rule-based "AI" for MVP
  let score = 50;
  let category = "GENERAL";

  if (emailDomain) {
    if (["gmail.com", "yahoo.com", "outlook.com"].includes(emailDomain)) {
      score -= 10; // Personal email, likely lower value
    } else {
      score += 20; // Business email
    }
  }

  if (data.message) {
    const msg = data.message.toLowerCase();
    if (msg.includes("urgent") || msg.includes("asap")) score += 10;
    if (msg.includes("pricing") || msg.includes("quote")) {
      score += 15;
      category = "SALES";
    }
    if (msg.includes("help") || msg.includes("issue") || msg.includes("bug")) {
      category = "SUPPORT";
      score += 5; // Existing customer issues are high priority
    }
    if (msg.includes("demo")) {
      score += 25;
      category = "SALES";
    }
  }

  // Cap score
  score = Math.min(Math.max(score, 0), 100);

  return {
    score,
    category,
    summary: `Lead classified as ${category} based on intent. Score: ${score}/100.`,
  };
}



