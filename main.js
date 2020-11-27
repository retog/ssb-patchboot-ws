const fs = require('fs')
const path = require('path')
const { EntryPage } = require('./lib/EntryPage.js')
const package = require('./package.json')

module.exports = {
  name: 'patchboot-ws',
  version: package.version,
  manifest: {},
  init: function (sbot) {
    console.log(`initializing patchboot at http://${sbot.config.ws.host}:${sbot.config.ws.port}/patchboot/`)
    const serverPublicKey = sbot.id.substring(1)
    const entryPage = new EntryPage(serverPublicKey)
    sbot.ws.use(function (req, res, next) {
      if (req.url === '/patchboot') {
        res.statusCode = 301
        res.setHeader('Location', '/patchboot/')
        res.end()
      } else if (req.url === '/patchboot/') {
        entryPage.render(req, res)
      } else if(req.url.startsWith('/patchboot/')) {
        const subpath = req.url.substring(11)
        const filepath = path.join(__dirname,'public', subpath)
        fs.readFile(filepath, (err, data) => {
          if (err) {
            console.log(`${err} getting ${filepath}`)
            res.statusCode = 301
            res.end(err.message)
          }
          else res.end(data)
        })
      } else next()
    })
  }
}