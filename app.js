const { startServer } = require('./system/server.js')
const { captureScreen, getDimensions } = require('./system/capture.js')
const {
  moveMouse,
  clickMouse,
  doubleMouse,
  rightMouse
} = require('./system/mouse.js')

/**
 * @typedef {import('http').ServerResponse} ServerResponse
 * @typedef {import('http').IncomingMessage} IncomingMessage
 */

startServer(serverOnInit, serverOnRequest)

function serverOnInit() {}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} _res
 * @return {boolean}
 */
function serverOnRequest(req, res) {
  if (req.url === '/screen') {
    captureScreen()
      .then(res.end.bind(res))
      .catch(() => {
        res.statusCode = 503
        res.end()
      })
    return true
  }

  if (req.url === '/mousemove' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk) => (body += chunk.toString()))
    req.on('end', () => {
      const { mx, my } = JSON.parse(body)
      moveMouse(mx | 0, my | 0).catch(() => (res.statusCode = 503))
      res.end()
    })
    return true
  }

  if (req.url === '/mouseclick' && req.method === 'POST') {
    clickMouse().catch(() => (res.statusCode = 503))
    res.end()
    return true
  }

  if (req.url === '/mousedouble' && req.method === 'POST') {
    doubleMouse().catch(() => (res.statusCode = 503))
    res.end()
    return true
  }

  if (req.url === '/mouseright' && req.method === 'POST') {
    rightMouse().catch(() => (res.statusCode = 503))
    res.end()
    return true
  }

  return false
}
