// index.js
const express = require("express");
const app = express();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ADMIN_SEND_MESSAGE_TOKEN = process.env.ADMIN_SEND_MESSAGE_TOKEN;

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
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (let i = 0; i < body.entry.length; i++) {
      const entry = body.entry[i];
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      console.log({ event });

      if (event.message) {
        const { text, attachments } = event.message;

        // 🎯 Handle text
        if (text) {
          console.log("📩 ข้อความที่ได้รับ:", text);
          console.log({ senderId, text });

          await sendReply(senderId, `คุณส่งข้อความว่า: "${text}"`);
        }

        // 📎 Handle attachments (media or sticker)
        if (attachments && attachments.length > 0) {
          for (let j = 0; j < attachments.length; j++) {
            const attachment = attachments[j];
            const type = attachment.type;
            const url = attachment.payload?.url || "(ไม่มี URL)";

            console.log(`📎 ได้รับ ${type.toUpperCase()}: ${url}`);

            if (
              type === "image" ||
              type === "video" ||
              type === "audio" ||
              type === "file"
            ) {
              await sendReply(
                senderId,
                `ได้รับไฟล์ประเภท ${type} แล้ว ขอบคุณครับ!`
              );
            } else if (type === "sticker") {
              await sendReply(
                senderId,
                "น่ารักจัง ขอบคุณสำหรับสติ๊กเกอร์ครับ!"
              );
            } else {
              await sendReply(
                senderId,
                `ได้รับสิ่งที่ส่งมาแล้ว (ประเภท: ${type})`
              );
            }
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// 3️⃣ Send message back
async function sendReply(senderId, messageText) {
  await fetch(`https://graph.facebook.com/v23.0/me/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `bearer ${ADMIN_SEND_MESSAGE_TOKEN}`,
    },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text: messageText },
    }),
  })
    .then(() => {
      console.log("✅ ส่งข้อความกลับแล้ว");
    })
    .catch((err) => {
      console.error(
        "❌ ส่งข้อความไม่สำเร็จ:",
        err.response?.data || err.message
      );
    })
    .finally(() => console.log("function sendReply"));
}

app.get("/", async (req, res) => {
  res.send("Hello Welcone to Geeleed Facebook API");
});
// 4️⃣ Start server
const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
  console.log("🚀 Server is running on port", PORT);
});
