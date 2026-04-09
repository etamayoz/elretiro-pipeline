const { analyzeEmail } = require("../services/claude");

async function handleInboundEmail(req, res) {
  // Acknowledge Mailgun immediately — it retries if it doesn't get 200 quickly
  res.sendStatus(200);

  const { sender, recipient, subject, "body-plain": bodyPlain, "body-html": bodyHtml } = req.body;

  if (!sender || (!bodyPlain && !bodyHtml)) {
    console.warn("Received incomplete email payload", { sender, subject });
    return;
  }

  const email = { sender, recipient, subject, body: bodyPlain || bodyHtml };

  console.log(`[email] From: ${sender} | Subject: ${subject}`);

  try {
    const result = await analyzeEmail(email);
    console.log(`[claude] Analysis for email from ${sender}:`, result);
    // TODO: persist result, trigger downstream actions, etc.
  } catch (err) {
    console.error("[claude] Failed to analyze email:", err.message);
  }
}

module.exports = { handleInboundEmail };
