const express = require("express");
const facebookWebhookRouter = require("./features/facebook/presentation/facebookWebhookRouter");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Welcome to Geeleed Facebook API");
});

app.use("/webhook", facebookWebhookRouter);

module.exports = app;
