import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

const staticDir = process.env.STATIC_DIR || 'dist'

app.use(express.static(path.join(__dirname, staticDir)))

// SPA fallback (no "*")
app.use((req, res) => {
  res.sendFile(path.join(__dirname, staticDir, 'index.html'))
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
