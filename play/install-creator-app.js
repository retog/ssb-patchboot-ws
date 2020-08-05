const Connection = require("ssb-client");
const pull = require("pull-stream");
const fs = require("fs");
const path = require("path");
Connection(async (err, server) => {
    if (err) {
        console.log('could not get keys, got err', err);
    }
    else {
        console.log('hj ' + server);
        console.log(server.publish);
        var script = fs.readFileSync(path.join(__dirname, '.', 'CreatorApp.js'), 'utf8');
        console.log('response', script);
        pull(pull.values([script]), server.blobs.add(undefined, function (err, hash) {
            console.log('cb ', arguments);
            server.publish({
                type: 'patchboot-app',
                name: 'App creator',
                comment: 'Create your own app!',
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