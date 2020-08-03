ssb((err, server) => {
  if (err) {
    throw err
  }
  console.log('Connection established')

  server.whoami((err, keys) => {
    if (err) console.log('could not get keys, got err', err)
    else {
      const html = `
        <body>
          <h1>Who am I?</h1>

          <div>I am ${keys.id}</div>
        </body>
      </html>`;
      root.innerHTML = html;
    }

    server.close()
  })
})

