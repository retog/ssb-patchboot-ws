#! /usr/bin/env node

const Connection = require("ssb-client");
const pull = require("pull-stream");
const fs = require("fs");
const path = require("path");

if (process.argv.length < 4) {
  console.error("Usage: patchboot-install FILE APPNAME [COMMENT]")
  process.exit(1)
}

Connection(async (err, server) => {
    if (err) {
        console.log('could not get keys, got err', err);
    }
    else {
        console.log('hj ' + server);
        console.log(server.publish);
        var script = fs.readFileSync(path.join('.', process.argv[2]), 'utf8');
        console.log('response', script);
        pull(pull.values([script]), server.blobs.add(undefined, function (err, hash) {
            console.log('cb ', arguments);
            server.publish({
                type: 'patchboot-app',
                name: process.argv[3],
                comment: process.argv[4],
                link: hash
            }, function (err, msg) {
                console.log(msg);
                server.close();
            });
            console.log("done");
        }));
    }
});
console.log("after connection");