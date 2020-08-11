const Prism = require('prismjs');

function showSource(name, code) {
  const outer = document.createElement('div')
  outer.id = 'outer'
  const oldTop = window.scrollY
  const oldLeft = window.scrollX
  window.scroll(0,0)
  document.body.classList.add('modal-open')
  document.body.appendChild(outer)
  const inner = document.createElement('div')
  inner.id = 'inner'
  outer.appendChild(inner)

  const header = document.createElement('div')
  inner.appendChild(header)
  header.classList.add('header')
  header.innerText = 'View source: '+name

  const main = document.createElement('div')
  inner.appendChild(main)
  main.classList.add('main')
  const pre = document.createElement('pre')
  main.appendChild(pre)
  const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
  pre.innerHTML = html

  const footer = document.createElement('div')
  inner.appendChild(footer)
  footer.classList.add('footer')
  const closebtn = document.createElement('button')
  footer.appendChild(closebtn)
  closebtn.innerText = 'Close'

  const close = () => {
    document.body.removeChild(outer)
    document.body.classList.remove('modal-open')
    window.scroll(oldLeft, oldTop)
  }

  outer.addEventListener('click', close)
  closebtn.addEventListener('click', close)
  inner.addEventListener('click', (event) => {
    event.stopPropagation()
  })
}

module.exports = { showSource }