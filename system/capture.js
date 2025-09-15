const childProcess = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

let isBusy = false

/**
 * @returns {Promise<{Buffer | null}>}
 */
async function captureScreen() {
  if (isBusy) throw new Error('Screen-shooter is busy.')

  isBusy = true

  const outPath = 'media/screenshot.jpg'
  await new Promise((resolve, reject) => {
    const cmd = `screenCapture ../${outPath}`
    const cwd = path.join(path.resolve(), './system')
    const handler = (err) => (err ? reject(err) : resolve())
    childProcess.exec(cmd, { cwd }, handler)
  })

  const buffer = fs.readFileSync(outPath)

  isBusy = false
  return buffer
}

function getDimensions() {
  return { width: 3200, height: 1800, scale: 2.5 }
}

module.exports = { captureScreen, getDimensions }
