const screenListener = new EventSource('/broadcast')
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let /** @type {ImageData} */ screenSketch = null

screenListener.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  if (data.type !== 'ImageDiffs') return
  if (screenSketch === null) return

  for (let i = 0; i < data.vect.length; i += 2) {
    const pos = rgbToRgbaPos(data.vect[i])
    const rgbBitGrid = parseInt(data.vect[i + 1], 36)
    screenSketch.data[pos] = rgbBitGrid >> 16
    screenSketch.data[pos + 1] = (rgbBitGrid >> 8) & 255
    screenSketch.data[pos + 2] = rgbBitGrid & 255
  }
  ctx.putImageData(screenSketch, 0, 0)
})

addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/screen_full')
  const data = await res.json()
  if (data.type !== 'ImagePixels') return
  const width = (canvas.width = data.width)
  const height = (canvas.height = data.height)

  const rgb = data.vect.data
  const rgba = Array((rgb.length / 3) * 4).fill(255)
  rgb.forEach((v, i) => (rgba[rgbToRgbaPos(i)] = v))

  screenSketch = ctx.createImageData(width, height)
  screenSketch.data.set(rgba)
  ctx.putImageData(screenSketch, 0, 0)
})

/**
 * @param {number} i
 * @returns {number}
 */
function rgbToRgbaPos(i) {
  return ((i / 3) | 0) * 4 + (i % 3)
}
