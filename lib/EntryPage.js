const {name, version} = require('../package.json')

module.exports.EntryPage = class EntryPage {

  //define either ssbPort or ssbBaseUri
  constructor(serverPubKey, ssbPort, ssbBaseUri) {
    this.serverPubKey = serverPubKey
    this.ssbPort = ssbPort
    this.ssbBaseUri = ssbBaseUri
  }

  render(req, res) {
    const hostname = req.headers.host.split(':')[0]
    res.end(`
    <!DOCTYPE html>
    <html>

    <head>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="./index.css">
      <title>PatchBoot - Scuttlebutt bootloader</title>
    </head>

    <body>
    <script src="./ssb-client.js"></script>
    <script>
      window.serverPubKey = '${this.serverPubKey}'
      window.ssbPort = '${this.ssbPort}'
      ${this.ssbBaseUri ? `window.ssbBaseUri = '${this.ssbBaseUri}'`:''}
    </script>
    <script src="./preload.bundle.js"></script>
    <script type="module">
      import './patch-boot.js'
      const patchBoot = document.createElement('patch-boot')
      patchBoot.ssbConnect = window.remoteSsbConnect
      console.log('patchBoot.ssbConnect', patchBoot.ssbConnect)
      document.body.appendChild(patchBoot)
    </script>
  </body>

  </html>
    `)
  }
}