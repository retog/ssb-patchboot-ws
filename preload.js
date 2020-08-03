const Connection = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }



  Connection((err, server) => {
    if (err) {
      console.log('could not get keys, got err', err);
    }
    else {
      const element = document.getElementById('apps')
      const view = document.getElementById('view')
      const shadowView = view.attachShadow({mode: 'closed'});
      console.log('monitoring', server);
      console.log(server.blobs.ls());
      const types = [];
      pull(server.createFeedStream({ live: true }), pull.drain(function (msg) {
        if (!msg.value) {
          return;
        }
        if (types.indexOf(msg.value.content.type) === -1) {
          if (msg.value.content.type == 'patchboot-app') {
            console.log(msg);
            const link = document.createElement('div')
            link.innerHTML = `${msg.value.content.comment} by ${msg.value.author} 
            (${(new Date(msg.value.timestamp)).toISOString()})`
            const blobId = msg.value.content.mentions[0].link;
            link.addEventListener('click', () => { 
              Connection((err, server) => {
                pull(
                  server.blobs.get(blobId), 
                  pull.collect(function (err, values) {
                    if (err) throw err
                    const code = values.join('')
                    console.log('executing', code);
                    window.setTimeout(() => {
                      const fun = new Function('root', 'ssb', code);
                      fun(shadowView, Connection);
                    }, 0);
                }))
              })
            })
            element.append(link)
          }
        }
      }, function (end) {
        console.log("ending with " + end);
      }));
      console.log("done");
    }
    //server.close();
  });
})