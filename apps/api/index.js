const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

app.listen(5000, () => console.log("Server running on port 5000"));
