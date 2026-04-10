require("dotenv").config();
const express = require("express");
const multer  = require("multer");
const { handleInboundEmail } = require("./handlers/email");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mailgun sends inbound webhooks as multipart/form-data.
// multer().any() parses all text fields into req.body and attachments into req.files.
const upload = multer();

app.get("/health", (_req, res) => res.json({ ok: true }));

// Mailgun inbound webhook
app.post("/inbound", upload.any(), handleInboundEmail);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
