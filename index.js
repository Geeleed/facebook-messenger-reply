// index.js
const express = require("express");
const axios = require("axios");
const app = express();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.use(express.json());

// 1️⃣ Facebook webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2️⃣ Receive messages from Facebook
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message) {
        const { text, attachments } = event.message;

        // 🎯 Handle text
        if (text) {
          console.log("📩 ข้อความที่ได้รับ:", text);
          sendReply(senderId, `คุณส่งข้อความว่า: "${text}"`);
        }

        // 📎 Handle attachments (media or sticker)
        if (attachments && attachments.length > 0) {
          attachments.forEach((attachment) => {
            const type = attachment.type;
            const url = attachment.payload?.url || "(ไม่มี URL)";

            console.log(`📎 ได้รับ ${type.toUpperCase()}: ${url}`);

            if (
              type === "image" ||
              type === "video" ||
              type === "audio" ||
              type === "file"
            ) {
              sendReply(senderId, `ได้รับไฟล์ประเภท ${type} แล้ว ขอบคุณครับ!`);
            } else if (type === "sticker") {
              sendReply(senderId, "น่ารักจัง ขอบคุณสำหรับสติ๊กเกอร์ครับ!");
            } else {
              sendReply(senderId, `ได้รับสิ่งที่ส่งมาแล้ว (ประเภท: ${type})`);
            }
          });
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// 3️⃣ Send message back
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
        "❌ ส่งข้อความไม่สำเร็จ:",
        err.response?.data || err.message
      );
    });
}

// 4️⃣ Start server
const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
  console.log("🚀 Server is running on port", PORT);
});
