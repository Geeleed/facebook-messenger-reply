// index.js
const express = require("express");

const app = express();
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // ตั้งเองไว้ใช้ยืนยันตอน Facebook callback
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // ใช้ตอบกลับข้อความ

app.use(express.json());

// ตรวจสอบ Webhook จาก Facebook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// รับข้อความจาก Facebook Page
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      const messageText = event.message?.text;

      console.log("📩 ข้อความที่ได้รับ:", messageText);

      // ถ้าต้องการตอบกลับ:
      if (messageText) {
        sendReply(senderId, "ขอบคุณที่ส่งข้อความมานะครับ!");
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// ส่งข้อความกลับไปยังผู้ใช้
const axios = require("axios");
function sendReply(senderId, messageText) {
  axios
    .post(
      `https://graph.facebook.com/v23.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: messageText },
      }
    )
    .then(() => {
      console.log("✅ ส่งข้อความกลับแล้ว");
    })
    .catch((err) => {
      console.error(
        "❌ ส่งข้อความไม่สำเร็จ",
        err.response?.data || err.message
      );
    });
}

const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
  console.log("🚀 Server is running on port", PORT);
});
