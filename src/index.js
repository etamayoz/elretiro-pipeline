require("dotenv").config();
const express = require("express");
const { handleInboundEmail } = require("./handlers/email");

const app = express();
const PORT = process.env.PORT || 3000;

// Mailgun sends multipart/form-data — express built-in parsers don't cover it.
// We use raw urlencoded for simple fields; Mailgun's inbound parse sends
// application/x-www-form-urlencoded when there are no attachments.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Mailgun inbound webhook
app.post("/inbound", handleInboundEmail);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
