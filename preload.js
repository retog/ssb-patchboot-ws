const Connection = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')
const { getSelfAssignedName } = require('./lib/identity.js')

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
        controller.app = msg.value;
        element.append(controller);
        const blobId = msg.value.content.link || msg.value.content.mentions[0].link;
        controller.addEventListener('run', () => {
          Connection((err, server) => {
            server.blobs.want(blobId).then(() => {
              pull(
                server.blobs.get(blobId),
                pull.collect(function (err, values) {
                  if (err) throw err
                  document.getElementById('title-ext').innerHTML = ' - Running: ' + (msg.value.content.name || msg.value.content.mentions[0].name);
                  const code = values.join('')
                  console.log('executing', code);
                  window.setTimeout(() => {
                    const fun = new Function('root', 'ssb', 'pull', code);
                    shadowView.innerHTML = '';
                    fun(shadowView, Connection, pull);
                  }, 0);
                }))
            });
          })
        })
      }, function (end) {
        console.log("ending with " + end);
      }));
    }
    //server.close();
  });
})

class AppController extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const appDescription = this.app;
    this.classList.add('block', 'app')
    const link = this.attachShadow({ mode: 'open' });
    link.innerHTML = `
        <style>
          .app>* {
            margin: 0;
            padding: 0 var(--spacing, 0.3rem);
          }

          .app>*:not(:first-child) {
            padding-top: var(--spacing, 0.3rem);
          }

          .app>*:not(:last-child) {
            border-bottom: 1px solid var(--lineColor);
            padding-bottom: var(--spacing, 0.3rem);
          }

          .app .author::before {
            font-family: inherit;
            content: 'by ';
            color: var(--lineColor);
          }

          .app .time::before {
            font-family: inherit;
            content: 'published ';
            color: var(--lineColor);
          }

          .app>*:empty::before {
            display: block;
            content: ' ';
            white-space: pre;
            background: #eeeeee;
            height: 1em;
            width: -webkit-fill-available;
          }

          .small {
            font-size: .8em;
          }
        </style>
        <div class="app">
          <h2>${appDescription.content.name || appDescription.content.mentions[0].name || appDescription.content.comment || ''}</h2>
          <div class="comment">${appDescription.content.comment || ''}</div>
          <div class="author"><code>${appDescription.author}</code></div>
          <div class="time">${(new Date(appDescription.timestamp)).toISOString() || ''}</div></div>`
    getSelfAssignedName(appDescription.author).then(name => {
      const authorElem = link.querySelector('.author');
      authorElem.innerHTML = name + " (<code class='small'>" + appDescription.author + "</code>)";
    }).catch(e => console.log(e));
    
    link.addEventListener('click', () => {
      this.dispatchEvent(new Event('run'));      
    })
  }
}

customElements.define("app-controller", AppController);