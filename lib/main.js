"use strict";

const fs = require('fs');

const path = require('path');

const {
  EntryPage
} = require('./EntryPage.js');

const http = require('http');

const packageJson = require('../package.json');

module.exports = {
  name: 'patchboot-ws',
  version: packageJson.version,
  manifest: {},
  init: function (sbot) {
    var _sbot$config$plugins, _sbot$config$plugins$, _sbot$config$plugins2, _sbot$config$plugins3, _sbot$config$plugins4, _sbot$config$plugins5;

    const ssbBaseUri = (_sbot$config$plugins = sbot.config.plugins) === null || _sbot$config$plugins === void 0 ? void 0 : (_sbot$config$plugins$ = _sbot$config$plugins["ssb-patchboot-ws"]) === null || _sbot$config$plugins$ === void 0 ? void 0 : _sbot$config$plugins$.ssbBaseUri;
    const ssbPort = sbot.config.ws.port;
    const serverPublicKey = sbot.id.substring(1);
    const entryPage = new EntryPage(serverPublicKey, ssbPort, ssbBaseUri);
    this.httpServer = http.createServer(function (req, res, next) {
      if (req.url === '/') {
        entryPage.render(req, res);
      } else if (req.url.startsWith('/')) {
        const subpath = req.url.substring(1);
        const filepath = path.join(__dirname, '../public', subpath);
        fs.readFile(filepath, (err, data) => {
          if (err) {
            console.log(`${err} getting ${filepath}`);
            res.statusCode = 400;
            res.end(err.message);
          } else {
            if (req.url.endsWith('.html')) {
              res.writeHead(200, {
                'Content-Type': 'text/html'
              });
            }

            if (req.url.endsWith('.png')) {
              res.writeHead(200, {
                'Content-Type': 'image/png'
              });
            }

            if (req.url.endsWith('.css')) {
              res.writeHead(200, {
                'Content-Type': 'text/css'
              });
            }

            if (req.url.endsWith('.js')) {
              res.writeHead(200, {
                'Content-Type': 'application/javascript'
              });
            }

            res.end(data);
          }
        });
      } else {
        res.statusCode = 404;
        res.end('not found');
      }
    });
    const port = ((_sbot$config$plugins2 = sbot.config.plugins) === null || _sbot$config$plugins2 === void 0 ? void 0 : (_sbot$config$plugins3 = _sbot$config$plugins2["ssb-patchboot-ws"]) === null || _sbot$config$plugins3 === void 0 ? void 0 : _sbot$config$plugins3.port) || 5585;
    const host = ((_sbot$config$plugins4 = sbot.config.plugins) === null || _sbot$config$plugins4 === void 0 ? void 0 : (_sbot$config$plugins5 = _sbot$config$plugins4["ssb-patchboot-ws"]) === null || _sbot$config$plugins5 === void 0 ? void 0 : _sbot$config$plugins5.host) || 'localhost';
    this.httpServer.listen(port, host, function () {
      var hostName = ~host.indexOf(':') ? '[' + host + ']' : host;
      console.log('notice', 'Listening on http://' + hostName + ':' + port + '/');
    }.bind(this));
  }
};