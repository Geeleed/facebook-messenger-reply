const express = require("express");
const handleIncomingMessage = require("../application/handleIncomingMessage");

const router = express.Router();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Facebook webhook verification
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Handle incoming messages
router.post("/", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    await handleIncomingMessage(body);
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
});

module.exports = router;
