const sendReply = require("../infrastructure/facebookApi");

module.exports = async function handleIncomingMessage(body) {
  for (const entry of body.entry) {
    const event = entry.messaging[0];
    const senderId = event.sender.id;
    const { message } = event;

    if (!message) return;

    const { text, attachments } = message;

    if (text) {
      console.log("📩 ข้อความที่ได้รับ:", text);
      await sendReply(senderId, `คุณส่งข้อความว่า: "${text}"`);
    }

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const type = attachment.type;
        const url = attachment.payload?.url || "(ไม่มี URL)";

        console.log(`📎 ได้รับ ${type.toUpperCase()}: ${url}`);

        if (["image", "video", "audio", "file"].includes(type)) {
          await sendReply(
            senderId,
            `ได้รับไฟล์ประเภท ${type} แล้ว ขอบคุณครับ!`
          );
        } else if (type === "sticker") {
          await sendReply(senderId, "น่ารักจัง ขอบคุณสำหรับสติ๊กเกอร์ครับ!");
        } else {
          await sendReply(senderId, `ได้รับสิ่งที่ส่งมาแล้ว (ประเภท: ${type})`);
        }
      }
    }
  }
};
