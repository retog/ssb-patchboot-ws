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
  console.log('Connecting')

  Connection((err, server) => {
    if (err) {
      throw err
    }
    console.log('Connection established')

    server.whoami((err, keys) => {
      if (err) console.log('could not get keys, got err', err)
      else {
        replaceText('user-id', keys.id)
      }

      console.log('disconnecting from server')
      server.close()
    })
  })


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
            console.log(msg.value.content);
            const link = document.createElement('div')
            link.textContent = msg.value.content.comment
            link.addEventListener('click', () => { 
              shadowView.innerHTML = `<h1>fobar ${msg.value.content.comment}</h1>`
            })
            element.append(link)
          }
        }
      }, function (end) {
        console.log("ending with " + end);
      }));
      console.log("done");
    }
  });
})