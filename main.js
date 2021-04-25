const fs = require('fs')
const path = require('path')
const { EntryPage } = require('./lib/EntryPage.js')
const http = require('http')
const package = require('./package.json')

module.exports = {
  name: 'patchboot-ws',
  version: package.version,
  manifest: {},
  init: function (sbot) {
    const ssbBaseUri = sbot.config.plugins?.["ssb-patchboot-ws"]?.ssbBaseUri
    const ssbPort = sbot.config.ws.port
    const serverPublicKey = sbot.id.substring(1)
    const entryPage = new EntryPage(serverPublicKey, ssbPort, ssbBaseUri)
    this.httpServer = http.createServer(function (req, res, next) {
      if (req.url === '/') {
        entryPage.render(req, res)
      } else if(req.url.startsWith('/')) {
        const subpath = req.url.substring(1)
        const filepath = path.join(__dirname,'public', subpath)
        fs.readFile(filepath, (err, data) => {
          if (err) {
            console.log(`${err} getting ${filepath}`)
            res.statusCode = 400
            res.end(err.message)
          } else {
            if (req.url.endsWith('.html')) {
              res.writeHead(200, {'Content-Type': 'text/html'});
            }
            if (req.url.endsWith('.png')) {
              res.writeHead(200, {'Content-Type': 'image/png'});
            }
            if (req.url.endsWith('.css')) {
              res.writeHead(200, {'Content-Type': 'text/css'});
            }
            if (req.url.endsWith('.js')) {
              res.writeHead(200, {'Content-Type': 'application/javascript'});
            }
            res.end(data)
          }
        })
      } else {
        res.statusCode = 404
        res.end('not found')
      }
    })
    const port = sbot.config.plugins?.["ssb-patchboot-ws"]?.port || 5585
    const host = sbot.config.plugins?.["ssb-patchboot-ws"]?.host || 'localhost'
    this.httpServer.listen(port, host, function () {
      var hostName = ~host.indexOf(':') ? '[' + host + ']' : host
      console.log('notice', 'Listening on http://' + hostName + ':' + port + '/')
    }.bind(this))
  }
}