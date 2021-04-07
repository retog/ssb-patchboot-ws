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
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <link rel="shortcut icon" type="image/jpg" href="./shelve.svg"/>
    <link rel="stylesheet" href="./index.css">
    <link rel="stylesheet" href="./prism.css">
    <title>PatchBoot - Scuttlebutt bootloader</title>
  </head>

  <body>
    <header id="bar">
      <h1>PatchBoot <span id="title-ext" /></h1>
      <div id="icons">
        <button id="toggle-info">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        </button>
        <button id="toggle-apps">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M16,20H20V16H16M16,14H20V10H16M10,8H14V4H10M16,8H20V4H16M10,14H14V10H10M4,14H8V10H4M4,20H8V16H4M10,20H14V16H10M4,8H8V4H4V8Z" />
          </svg>
        </button>
      </div>
    </header>
    <main>
      <header id="info">
        <div class="block notice">
          <p>PatchBoot allows executing apps from your Scuttleverse, this is ${name}:${version}</p>
          <p>
            Choose the app you would like to execute - only execute apps you trust.</p>
        </div>
      </header>
      <div id="apps-area"></div>
      <div id="view"></div>
    </main>

    <!-- You can also require other files to run in this process -->
    <script src="./ssb-client.js"></script>
    <script>
      window.serverPubKey = '${this.serverPubKey}'
      window.ssbPort = '${this.ssbPort}'
      ${this.ssbBaseUri ? `window.ssbBaseUri = '${this.ssbBaseUri}'`:''}
    </script>
    <script src="./preload.bundle.js"></script>
  </body>

  </html>
    `)
  }
}