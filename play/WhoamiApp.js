const html = `
<html>
  <body>
    <h1>Who am I?</h1>

    <div>I am ...</div>
  </body>
</html>`;
root.innerHTML = html;

sbot.whoami((err, keys) => {
  if (err) console.log('could not get keys, got err', err)
  else {
    const html = `
    <html>
      <body>
        <h1>Who am I?</h1>

        <div>I am ${keys.id}</div>
      </body>
    </html>`;
    root.innerHTML = html;
  }
})

