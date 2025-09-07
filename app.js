const { startServer, pushMessage } = require('./system/server.js')
const { captureScreen } = require('./system/capture.js')

/**
 * @typedef {import('http').ServerResponse} ServerResponse
 * @typedef {import('http').IncomingMessage} IncomingMessage
 */

const /** @type {ServerResponse[]} */ queue = []

let isBusy = false

startServer(serverOnInit, serverOnRequest)
queue.push({ res: null })
broadcastScreen()

function serverOnInit() {}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} _res
 * @return {boolean}
 */
function serverOnRequest(req, res) {
  if (req.url === '/screen_full') {
    queue.push(res)
    return true
  }

  return false
}

let maxSendTime = 0

function broadcastScreen() {
  if (isBusy) return setTimeout(broadcastScreen, 20)

  isBusy = true

  if (queue.length) {
    const res = queue.shift()
    captureScreen('ImagePixels').then((data) => {
      res.end?.(JSON.stringify(data))
      isBusy = false
    })
  } else {
    captureScreen('ImageDiffs').then((data) => {
      // let timer = performance.now()

      pushMessage(data)

      // maxSendTime = Math.max(maxSendTime, (performance.now() - timer) | 0)
      // console.info(maxSendTime)
      isBusy = false
    })
  }

  setTimeout(broadcastScreen, 20)
}
