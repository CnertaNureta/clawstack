/**
 * Parse SKILL.md content to extract structured skill metadata.
 */
export interface ParsedSkill {
  name: string;
  description: string;
  tags: string[];
  category: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  communication: [
    "whatsapp", "slack", "discord", "telegram", "email", "sms",
    "imessage", "teams", "chat", "message", "notification",
  ],
  productivity: [
    "calendar", "todo", "notes", "reminder", "schedule", "task",
    "notion", "obsidian", "trello", "asana",
  ],
  "dev-tools": [
    "github", "git", "code", "debug", "deploy", "docker", "ci",
    "test", "lint", "vscode", "ide", "terminal", "api",
  ],
  "smart-home": [
    "homeassistant", "iot", "light", "thermostat", "sensor",
    "zigbee", "mqtt", "alexa", "homekit",
  ],
  finance: [
    "crypto", "bitcoin", "trading", "stock", "portfolio", "defi",
    "wallet", "price", "market", "bank",
  ],
  entertainment: [
    "music", "spotify", "movie", "game", "youtube", "podcast",
    "stream", "media", "play",
  ],
  security: [
    "password", "vpn", "firewall", "scan", "audit", "encrypt",
    "auth", "2fa", "security",
  ],
  "ai-models": [
    "openai", "gpt", "claude", "llama", "ollama", "model",
    "embedding", "vector", "rag", "anthropic",
  ],
  automation: [
    "cron", "schedule", "workflow", "automate", "trigger", "webhook",
    "zapier", "n8n", "ifttt",
  ],
  social: [
    "twitter", "reddit", "linkedin", "instagram", "social",
    "post", "feed", "follow",
  ],
};

export function inferCategory(
  name: string,
  description: string,
  tags: string[]
): string {
  const text = `${name} ${description} ${tags.join(" ")}`.toLowerCase();

  let bestCategory = "other";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce(
      (sum, kw) => sum + (text.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export function parseSkillMd(content: string): ParsedSkill {
  const lines = content.split("\n");

  // Extract name from first heading
  let name = "Unknown Skill";
  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+)/);
    if (headingMatch) {
      name = headingMatch[1].trim();
      break;
    }
  }

  // Extract description (first non-empty, non-heading paragraph)
  let description = "";
  let foundHeading = false;
  for (const line of lines) {
    if (line.startsWith("#")) {
      foundHeading = true;
      continue;
    }
    if (foundHeading && line.trim() && !line.startsWith("#")) {
      description = line.trim();
      break;
    }
  }

  // Extract tags from content
  const tags: string[] = [];
  const tagPatterns = [
    /tags?:\s*(.+)/i,
    /keywords?:\s*(.+)/i,
    /categories?:\s*(.+)/i,
  ];

  for (const line of lines) {
    for (const pattern of tagPatterns) {
      const match = line.match(pattern);
      if (match) {
        tags.push(
          ...match[1].split(/[,;|]/).map((t) => t.trim().toLowerCase()).filter(Boolean)
        );
      }
    }
  }

  const category = inferCategory(name, description, tags);

  return { name, description, tags, category };
}
