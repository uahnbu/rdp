const fs = require('node:fs')
const os = require('node:os')
const http = require('node:http')
const path = require('node:path')

const urlMap = {
  '/': 'public/index.html',
  '/index.html': 'public/index.html',
  '/client.js': 'public/client.js',
  '/screenshot.jpg': 'public/screenshot.jpg'
}

const mimeMap = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg'
}

const herald = {
  /** @type {http.ServerResponse} */
  response: null,
  pushMessage(data) {
    if (!this.response) return
    const json = JSON.stringify(data)
    // console.info(json.length)
    this.response.write('data: ' + json)
    this.response.write('\n\n')
  }
}

function pushMessage(data) {
  herald.pushMessage(data)
}

/**
 * @param {() => void} serverOnInit
 * @param {() => boolean} serverOnRequest
 */
function startServer(serverOnInit, serverOnRequest) {
  let /** @type {string} */ address
  let /** @type {number} */ port

  const nets = os.networkInterfaces()['Wi-Fi']
  const ip = nets.find((net) => net.family === 'IPv4').address

  const server = http.createServer((req, res) => {
    if (serverOnRequest(req, res)) return
    if (req.method === 'GET')
      switch (req.url) {
        case '/address':
          return res.end(address)
        case '/broadcast':
          return checkOnTheHerald.call(res)
        default:
          return handleGetRequest.call(res, req.url)
      }
    res.writeHead(405)
    res.end('Method not allowed')
  })

  server.listen(60_000, () => {
    port = server.address().port
    address = `http://${ip}:${port}`
    console.log('Server is running at ' + address)
    serverOnInit()
  })
}

/**
 * @this {http.ServerResponse}
 */
function checkOnTheHerald() {
  herald.response = this
  this.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream'
  })
}

/**
 * @param {string} url
 */
function handleGetRequest(url) {
  if (!urlMap.hasOwnProperty(url)) {
    this.writeHead(404)
    return this.end('Not found')
  }
  const filePath = path.join(path.resolve(), urlMap[url])
  const ext = path.extname(filePath)
  this.writeHead(200, { 'Content-Type': mimeMap[ext] })
  // res.end  : Data is sent as a whole.
  // res.write: Data is sent in a series of chunks.
  this.write(fs.readFileSync(filePath))
  return this.end()
}

module.exports = { startServer, pushMessage }
