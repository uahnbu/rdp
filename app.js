const { startServer } = require('./system/server.js')
const { captureScreen, getDimensions } = require('./system/capture.js')

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
        res.statusCode = 429
        res.end()
      })
    return true
  }

  return false
}
