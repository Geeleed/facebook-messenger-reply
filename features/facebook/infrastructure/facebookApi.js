const fetch = require("node-fetch");
const ADMIN_SEND_MESSAGE_TOKEN = process.env.ADMIN_SEND_MESSAGE_TOKEN;

module.exports = async function sendReply(senderId, messageText) {
  try {
    await fetch(
      `https://graph.facebook.com/v23.0/me/messages?access_token=${ADMIN_SEND_MESSAGE_TOKEN}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipient: { id: senderId },
          message: { text: messageText },
        }),
      }
    );
    console.log("✅ ส่งข้อความกลับแล้ว");
  } catch (err) {
    console.error("❌ ส่งข้อความไม่สำเร็จ:", err.message);
  }
};
