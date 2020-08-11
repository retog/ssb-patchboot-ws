ssb((err, server) => {
  if (err) throw err

  const opts = {
    limit: 100,
    reverse: true
  }

  pull(
    server.query.read(opts),
    pull.drain(receive)
  )

  function receive(msg) {
    if (err) {
      console.error(err)
      server.close()
      return
    }
    render(msg)
  }
})

function render(msg) {
  root.innerHTML += `<textarea rows="16" cols="80">${JSON.stringify(msg, null, 2)}</textarea>`
}
