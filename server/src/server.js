/**
 * LiveScore backend — Express + WebSocket server.
 *
 * Start: node src/server.js
 * Env:   PORT=3001  USE_MOCK_DATA=false
 */

import http from 'http'
import express from 'express'
import { WebSocketServer } from 'ws'
import { startPolling, stopPolling } from './services/poller.js'
import { getAllGamesByDay, getRecentAlerts, addAlert, getAllPlayoffs } from './services/cache.js'
import { detectAlerts } from './services/alerts.js'
import { fetchStandings, fetchPlayoffs } from './services/standings.js'

const PORT = Number(process.env.PORT ?? 3001)

// ─── Express ─────────────────────────────────────────────────────────────────

const app = express()

app.use(express.json())

// CORS for dev — allow Vite's default port
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/health', (_req, res) => {
  res.json({ ok: true, clients: wss.clients.size })
})

app.get('/api/standings/:league', async (req, res) => {
  try {
    const data = await fetchStandings(req.params.league)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/playoffs/:league', async (req, res) => {
  try {
    const data = await fetchPlayoffs(req.params.league)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ─── HTTP + WS server ─────────────────────────────────────────────────────────

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress
  console.log(`[ws] Client connected (${ip}) — total: ${wss.clients.size}`)

  // Send full snapshot from cache immediately
  const snapshot = {
    type:     'snapshot',
    games:    getAllGamesByDay(),
    alerts:   getRecentAlerts(),
    playoffs: getAllPlayoffs(),
  }
  ws.send(JSON.stringify(snapshot))

  ws.on('close', () => {
    console.log(`[ws] Client disconnected — total: ${wss.clients.size}`)
  })

  ws.on('error', (err) => {
    console.error(`[ws] Client error: ${err.message}`)
  })
})

/**
 * Broadcast a message to all connected WebSocket clients.
 * @param {object} message
 */
function broadcast(message) {
  const payload = JSON.stringify(message)
  for (const client of wss.clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(payload)
    }
  }
}

// ─── Polling ──────────────────────────────────────────────────────────────────

function onGameUpdate(prev, game) {
  const newAlerts = detectAlerts(prev, game)
  for (const alert of newAlerts) {
    addAlert(alert)
    broadcast({ type: 'alert', alert })
  }

  broadcast({ type: 'gameUpdate', game })
}

function onPlayoffUpdate(league, bracket) {
  broadcast({ type: 'playoffsUpdate', league, bracket })
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`)
  console.log(`[server] USE_MOCK_DATA=${process.env.USE_MOCK_DATA ?? 'false'}`)
  function broadcastSnapshot() {
    const snapshot = {
      type:     'snapshot',
      games:    getAllGamesByDay(),
      alerts:   getRecentAlerts(),
      playoffs: getAllPlayoffs(),
    }
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(JSON.stringify(snapshot))
    }
  }

  startPolling(onGameUpdate, broadcastSnapshot, onPlayoffUpdate).catch((err) => {
    console.error('[server] Polling failed to start:', err)
  })
})

process.on('SIGTERM', () => {
  stopPolling()
  server.close()
})

process.on('SIGINT', () => {
  stopPolling()
  server.close()
  process.exit(0)
})
