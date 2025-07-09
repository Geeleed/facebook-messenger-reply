const axios = require("axios");
const express = require("express");
const router = express.Router();

router.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      const messageText = event.message?.text;

      if (messageText) {
        console.log("ข้อความจากผู้ใช้:", messageText);

        // วิเคราะห์ข้อความตรงนี้ แล้วค่อยตอบกลับ
        const replyText = processMessage(messageText); // เช่น function NLP

        // ส่งข้อความกลับ
        sendReply(senderId, replyText);
      }
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

function processMessage(text) {
  if (text.includes("ราคา")) {
    return "สินค้าของเราราคาเริ่มต้นที่ 499 บาทค่ะ 😊";
  }
  return "ขออภัยค่ะ รบกวนสอบถามเพิ่มเติมหรือพิมพ์ 'ช่วยเหลือ' ได้เลยค่ะ";
}

const PAGE_ACCESS_TOKEN = process.env.YOUR_PAGE_ACCESS_TOKEN;

function sendReply(senderId, messageText) {
  axios.post(`https://graph.facebook.com/v23.0/me/messages`, {
    recipient: { id: senderId },
    message: { text: messageText }
  }, {
    params: {
      access_token: PAGE_ACCESS_TOKEN
    }
  }).catch(err => {
    console.error("ส่งข้อความไม่สำเร็จ:", err.response?.data || err.message);
  });
}

module.exports = router;
