const express = require('express');
const { EntryPage } = require('./lib/EntryPage.js')

const Server = require('ssb-server')
const Client = require('ssb-client')
const config = require('ssb-config')
const fs = require('fs')
const path = require('path')

let serverPublicKey;
Client((err, sbot) => {
  if (err) {
    console.log("could not connect to existing server instance, starting new one")

    // add plugins
    Server
      .use(require('ssb-master'))
      .use(require('ssb-gossip'))
      .use(require('ssb-replicate'))
      .use(require('ssb-backlinks'))
      .use(require('ssb-blobs'))
      .use(require('ssb-ws'))
      .use(require('ssb-query'))
      .use(require('ssb-friends'))
      .use(require('ssb-links'))
      .use(require('ssb-ooo'))
      .use(require('ssb-ebt'))
      .use(require('ssb-invite'))
      .use(require('ssb-search'))

    //config.master.push("@lPycwhn7dAtZcCdb5ErppkM5KVZI+em4e5TFQMn3+sY=.ed25519")
    const server = Server(config)

    serverPublicKey = server.keys.public

    // save an updated list of methods this server has made public
    // in a location that ssb-client will know to check
    const manifest = server.getManifest()
    fs.writeFileSync(
      path.join(config.path, 'manifest.json'), // ~/.ssb/manifest.json
      JSON.stringify(manifest, undefined,2)
    )
    /* To disable security alltogether
    server.auth.hook(function (fn, args) {
      var id = args[0]
      var cb = args[1]
      //FIXME this diables security alltogether
      cb(null, {allow: null, deny: null})
    })*/
  } else {
    serverPublicKey = sbot.id.substring(1)
    sbot.close()
  }

  const entryPage = new EntryPage(serverPublicKey)

  const app = express();

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

})
