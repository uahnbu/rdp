const childProcess = require('node:child_process')
const path = require('node:path')

let isBusy = false
let queue = null

const moveMouse = (x, y) => handleMouse(`mouse moveTo ${x}x${y}`)
const clickMouse = () => handleMouse('mouse click')
const doubleMouse = () => handleMouse('mouse doubleClick')
const rightMouse = () => handleMouse('mouse rightClick')

/**
 * @param {string} cmd
 * @param {MouseEvent} event
 */
async function handleMouse(cmd) {
  if (isBusy || queue) {
    if (cmd.startsWith('mouse moveTo')) return
    queue && clearTimeout(queue)
    queue = setTimeout(() => (handleMouse(cmd), (queue = null)), 20)
    return
  }

  isBusy = true

  await new Promise((resolve, reject) => {
    const cwd = path.join(path.resolve(), './system')
    const handler = (err) => (err ? reject(err) : resolve())
    childProcess.exec(cmd, { cwd }, handler)
  })

  isBusy = false
}

module.exports = { moveMouse, clickMouse, doubleMouse, rightMouse }
