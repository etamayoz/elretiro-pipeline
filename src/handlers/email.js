const { analyzeEmail } = require("../services/claude");

const MONITOR_WEBHOOK = "https://api.monitor.elretiro.cc/webhook/monitor";
const MONITOR_RECIPIENT = "monitor@mg.elretiro.cc";

async function handleInboundEmail(req, res) {
  // Acknowledge Mailgun immediately — it retries if it doesn't get 200 quickly
  res.sendStatus(200);

  const { sender, recipient, subject, "body-plain": bodyPlain, "body-html": bodyHtml } = req.body;

  // ── Relay monitor@ emails to the LatAm Macro Monitor backend ─────────────
  if (recipient && recipient.includes(MONITOR_RECIPIENT)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      await fetch(MONITOR_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      console.log(`[relay] forwarded monitor@ email to LatAm Macro Monitor — subject: ${subject}`);
    } catch (err) {
      console.error(`[relay] failed to forward monitor@ email — ${err.message}`);
    }
    return;
  }
  // ─────────────────────────────────────────────────────────────────────────

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
