const Y = require('yjs')
const WebSocket = require('ws')
const map = new Map()

function setupWSConnection(conn, req) {
  const doc = new Y.Doc()
  const awareness = { clients: new Map() }

  conn.on('message', (message) => {
    // Here you'd handle sync, awareness, etc.
    // You can refer to the actual implementation in y-websocket/bin/utils.js
    console.log('Received message:', message)
  })

  conn.on('close', () => {
    console.log('Connection closed')
  })
}

module.exports = { setupWSConnection }
