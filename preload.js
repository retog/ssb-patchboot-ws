const ssb = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')
const { IdentityManager } = require('./lib/IdentityManager.js')
const {VotesManager} = require('./lib/VotesManager.js')
const {showSource} = require('./lib/showSource.js')
require('./lib/AppController.js')

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
  if (process.env.ssb_appname) {
    replaceText(`app_name`, 'SSB App: '+process.env.ssb_appname+'.')
  } 

  document.getElementById('toggle-info').addEventListener('click', (e) => {
    e.preventDefault;
    document.getElementById('info').classList.toggle('hidden')
  })
  document.getElementById('toggle-apps').addEventListener('click', (e) => {
    e.preventDefault;
    document.getElementById('apps').classList.toggle('hidden')
  })

  ssb((err, server) => {
    if (err) {
      console.log('could not get keys, got err', err);
    }
    else {
      const votesManager = new VotesManager(server)
      const element = document.getElementById('apps')
      const view = document.getElementById('view')
      const shadowView = view.attachShadow({ mode: 'closed' });
      const opts = {
        reverse: true,
        query: [
          {
            $filter: {
              value: {
                content: { type: 'patchboot-app' }
              }
            }
          }
        ]
      }

      pull(server.query.read(opts), pull.drain(function (msg) {
        if (!msg.value) {
          return;
        }
        if (msg.value.content.type !== 'patchboot-app') {
          throw "unexpected type"
        }
        const controller = document.createElement('app-controller');
        controller.msg = msg
        controller.server = server
        element.append(controller);
        const blobId = msg.value.content.link || msg.value.content.mentions[0].link;
        controller.addEventListener('run', () => {
          server.blobs.want(blobId).then(() => {
            pull(
              server.blobs.get(blobId),
              pull.collect(function (err, values) {
                if (err) throw err
                document.getElementById('title-ext').innerHTML = ' - Running: ' + (msg.value.content.name || msg.value.content.mentions[0].name);
                const code = values.join('')
                window.setTimeout(() => {
                  const fun = new Function('root', 'ssb', 'pull', code);
                  shadowView.innerHTML = '';
                  fun(shadowView, ssb, pull);
                }, 0)
              }))
          });
        });
        controller.addEventListener('view-source', () => {
          server.blobs.want(blobId).then(() => {
            pull(
              server.blobs.get(blobId),
              pull.collect(function (err, values) {
                if (err) throw err
                const code = values.join('')
                showSource((msg.value.content.name || msg.value.content.mentions[0].name), code)
              }))
          })
        })
        controller.addEventListener('like', async () => {
          try {
            console.log(await votesManager.getVotes(msg.keys));
          } catch (e) {
            console.log('error', e);
          }
          return true
        })
        controller.addEventListener('unlike', () => {
          //vote(msg.key, 0)
        })
      }, function (end) {
        console.log("ending with " + end);
      }));
    }
  });
})