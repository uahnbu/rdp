let /** @type {HTMLElement} */ screenViewer

addEventListener('DOMContentLoaded', () => {
  screenViewer = document.getElementById('screenviewer')
  listenToScreen()
})

function listenToScreen() {
  fetch('/screen').then((http) => {
    http.arrayBuffer().then((data) => {
      const blob = new Blob([data], { type: 'image/jpeg' })
      screenViewer.src = URL.createObjectURL(blob)
      requestAnimationFrame(listenToScreen)
    })
  })
}
