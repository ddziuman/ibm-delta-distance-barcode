const express = require("express"); // This will be a static file server + backend processor for CSR application
const path = require("node:path"); // written in React, using bundler Vite
const app = express();
const distPath = path.join(__dirname + "/../" + "dist/");

const fileFromDist = (fileName) => path.join(distPath + fileName);
app.use(express.static(distPath)); // for preview-production the build folder

app.get("/", (req, res) => {
  res.sendFile(fileFromDist("index.html"));
});

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`Server started at ${URL}`);
});
