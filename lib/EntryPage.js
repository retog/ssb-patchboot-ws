module.exports.EntryPage = class EntryPage {

  constructor(serverPubKey, ssbPort) {
    this.serverPubKey = serverPubKey
    this.ssbPort = ssbPort
  }

  render(req, res) {
    const hostname = req.headers.host.split(':')[0]
    res.end(`
    <!DOCTYPE html>
  <html>

  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: ws://${hostname}:${this.ssbPort}/; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'">
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
          <p>PatchBoot is running on Node.js <span id="node-version"></span>. <span id="app_name"></span></p>
            <div id="app_name"></div>
          <p>
            Click on an app you would like to execute - only execute apps you trust.</p>
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
    </script>
    <script src="./preload.bundle.js"></script>
  </body>

  </html>
    `)
  }
}