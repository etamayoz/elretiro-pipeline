const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Analyzes an inbound email using Claude.
 * @param {{ sender: string, recipient: string, subject: string, body: string }} email
 * @returns {Promise<{ summary: string, intent: string, priority: string }>}
 */
async function analyzeEmail(email) {
  const prompt = `You are an assistant processing inbound emails for elretiro.cc.

Analyze the following email and respond with a JSON object containing:
- summary: a one-sentence summary of the email
- intent: the sender's apparent intent (e.g. "inquiry", "complaint", "reservation", "spam", "other")
- priority: "high", "medium", or "low"

Email:
From: ${email.sender}
To: ${email.recipient}
Subject: ${email.subject}

${email.body}

Respond ONLY with valid JSON, no markdown fencing.`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].text.trim();
  return JSON.parse(text);
}

module.exports = { analyzeEmail };
