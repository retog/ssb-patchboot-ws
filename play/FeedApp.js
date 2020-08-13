const opts = {
  limit: 100,
  reverse: true
}

ssb((err, sbot) => {
  pull(
    sbot.query.read(opts),
    pull.drain(receive)
  )
})

function receive(msg) {
  render(msg)
}


function render(msg) {
  root.innerHTML += `<textarea rows="16" cols="80">${JSON.stringify(msg, null, 2)}</textarea>`
}
