const fs = require('fs')
const path = require('path')
const { EntryPage } = require('./lib/EntryPage.js')

module.exports = {
  name: 'ssb-patchboot-ws',
  version: '0.0.1',
  manifest: {},
  init: function (sbot) {
    console.log('initializing patchboot')
    const serverPublicKey = sbot.id.substring(1)
    const entryPage = new EntryPage(serverPublicKey)
    sbot.ws.use(function (req, res, next) {
      console.log('handling', req.url)
      if (req.url === '/patchboot') {
        res.statusCode = 301
        res.setHeader('Location', '/patchboot/')
        res.end()
      } else if (req.url === '/patchboot/') {
        entryPage.render(req, res)
      } else if(req.url.startsWith('/patchboot/')) {
        const subpath = req.url.substring(11)
        const filepath = path.join('public', subpath)
        fs.readFile(filepath, (err, data) => {
          res.end(data)
        })
      } else next()
    })
  }
}



  
/*

  app.use(express.static('public'))

  // on the request to root (localhost:3000/)
  app.get('/', (req, res) => entryPage.render(req, res));

  // Change the 404 message modifing the middleware
  app.use(function(req, res, next) {
      res.status(404).send("Nothing here.");
  });

  // start the server in the port 3000 !
  app.listen(3000, function () {
      console.log('Example app listening on port 3000.');
  });
*/
