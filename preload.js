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

  document.getElementById('toggle-info').addEventListener('click', (e) => {
    e.preventDefault;
    document.getElementById('info').classList.toggle('hidden')
  })
  document.getElementById('toggle-apps').addEventListener('click', (e) => {
    e.preventDefault;
    document.getElementById('apps').classList.toggle('hidden')
  })

  Connection((err, server) => {
    if (err) {
      console.log('could not get keys, got err', err);
    }
    else {
      const element = document.getElementById('apps')
      const view = document.getElementById('view')
      const shadowView = view.attachShadow({mode: 'closed'});
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
        if (msg.value.content.type == 'patchboot-app') {
          console.log('app', msg.value);
          const link = document.createElement('div')
          link.classList.add('block', 'app')
          link.innerHTML = `<h2>${msg.value.content.mentions[0].name||msg.value.content.comment||''}</h2>
          <div class="comment">${msg.value.content.comment||''}</div>
          <div class="author">${msg.value.author||''}</div>
          <div class="time">${(new Date(msg.value.timestamp)).toISOString()||''}</div>`
          const blobId = msg.value.content.mentions[0].link;
          link.addEventListener('click', () => { 
            Connection((err, server) => {
              server.blobs.want(blobId).then(() => {
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
              });
            })
          })
          element.append(link)
        }
      }, function (end) {
        console.log("ending with " + end);
      }));
    }
    //server.close();
  });
})