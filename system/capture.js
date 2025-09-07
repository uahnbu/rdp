const childProcess = require('node:child_process')
const path = require('node:path')
const sharp = require('sharp')

/**
 * @typedef PixelDataStruct
 * @property {"ImagePixels"} type
 * @property {Uint8Array} vect
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef PixelDiffStruct
 * @property {"ImageDiffs"} type
 * @property {number[]} vect
 */

let prevScreenshot = null
let maxShotTime = 0,
  maxVectTime = 0,
  maxDiffTime = 0

/**
 * @param {"ImagePixels" | "ImageDiffs"} type
 * @returns {Promise<PixelDataStruct | PixelDiffStruct>}
 */
async function captureScreen(type) {
  // let timer = performance.now()

  const outPath = 'media/screenshot.jpg'
  await new Promise((resolve, reject) => {
    const cmd = `screenCapture ../${outPath}`
    const cwd = path.join(path.resolve(), './system')
    const handler = (err) => (err ? reject(err) : resolve())
    childProcess.exec(cmd, { cwd }, handler)
  })

  // maxShotTime = Math.max(maxShotTime, (performance.now() - timer) | 0)
  // timer = performance.now()

  const sharped = sharp(outPath)
  const screenshot = await sharped.raw().toBuffer()

  if (type === 'ImagePixels' || !prevScreenshot) {
    const metadata = await sharped.metadata()
    const { width, height } = metadata
    const vect = (prevScreenshot = screenshot)
    return { type, vect, width, height }
  }

  // maxVectTime = Math.max(maxVectTime, (performance.now() - timer) | 0)
  // timer = performance.now()

  const /** @type {number[]} */ diffs = []
  for (let i = 0; i < screenshot.length; i += 3) {
    if (
      screenshot[i] === prevScreenshot[i] &&
      screenshot[i + 1] === prevScreenshot[i + 1] &&
      screenshot[i + 2] === prevScreenshot[i + 2]
    )
      continue
    const rgbBitGrid =
      (screenshot[i] << 16) | (screenshot[i + 1] << 8) | screenshot[i + 2]
    diffs.push(i, rgbBitGrid)
  }

  // prevScreenshot = screenshot
  // maxDiffTime = Math.max(maxDiffTime, (performance.now() - timer) | 0)
  // console.info(maxShotTime, maxVectTime, maxDiffTime)

  return { type, vect: diffs }
}

module.exports = { captureScreen }
