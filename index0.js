require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/test", require("./src/routes/test"));
app.use("/messenger", require("./src/routes/messenger"));

app.listen(8100, () => console.log(`http://localhost:8100`));
