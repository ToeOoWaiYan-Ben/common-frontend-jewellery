import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// For Vite build output is usually "dist"
// For CRA build output is usually "build"
const staticDir = process.env.STATIC_DIR || "dist";

app.use(express.static(path.join(__dirname, staticDir)));

// SPA fallback (important!)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, staticDir, "index.html"));
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
