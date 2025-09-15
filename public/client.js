let /** @type {HTMLElement} */ screenViewer
let /** @type {HTMLElement} */ screenDetail

addEventListener('DOMContentLoaded', () => {
  screenViewer = document.getElementById('screenviewer')
  screenDetail = document.getElementById('screendetail')
  listenToScreen()
})

function listenToScreen() {
  fetch('/screen').then((http) => {
    if (!http.ok) return requestAnimationFrame(listenToScreen)
    http.arrayBuffer().then((data) => {
      if (!data) return requestAnimationFrame(listenToScreen)
      const blob = new Blob([data], { type: 'image/jpeg' })
      screenViewer.src = URL.createObjectURL(blob)
      requestAnimationFrame(listenToScreen)
    })
  })
}

document.addEventListener('mousemove', (e) => handleMouseMove(e))
document.addEventListener('touchmove', (e) => handleMouseMove(e.touches[0]))

/**
 * @param {MouseEvent|Touch} e
 */
function handleMouseMove(e) {
  const rx = (e.clientX - screenViewer.offsetLeft) / screenViewer.offsetWidth
  const ry = (e.clientY - screenViewer.offsetTop) / screenViewer.offsetHeight
  if (rx < 0 || ry < 0 || rx > 1 || ry > 1) return
  const mx = rx * screenViewer.naturalWidth
  const my = ry * screenViewer.naturalHeight
  addLog(`Move to ${mx | 0} x ${my | 0}`)
  fetch(`/mousemove`, {
    method: 'POST',
    body: JSON.stringify({ mx, my })
  })
}

let singleClicked = null

document.addEventListener('click', (e) => {
  if (e.detail > 1) return
  singleClicked = setTimeout(() => {
    addLog('Click')
    fetch('/mouseclick', { method: 'POST' })
  }, 300)
})

document.addEventListener('dblclick', (e) => {
  singleClicked && clearTimeout(singleClicked)
  addLog('Double Click')
  fetch('/mousedouble', { method: 'POST' })
})

document.addEventListener('contextmenu', (e) => {
  addLog('Right Click')
  fetch('/mouseright', { method: 'POST' })
  e.preventDefault()
})

function addLog(msg) {
  screenDetail.innerHTML =
    screenDetail.innerHTML.split('<br>').slice(-5).join('<br>') + `<br>${msg}`
}
