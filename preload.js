const Connection = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')
const { getSelfAssignedName } = require('./lib/identity.js')
const Prism = require('prismjs');
const {vote, getVotes, getOwnVote} = require('./lib/voting.js')

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
        controller.msg = msg;
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
                  window.setTimeout(() => {
                    const fun = new Function('root', 'ssb', 'pull', code);
                    shadowView.innerHTML = '';
                    fun(shadowView, Connection, pull);
                  }, 0)
                  server.close()
                }))
            });
          })
        });
        controller.addEventListener('view-source', () => {
          Connection((err, server) => {
            server.blobs.want(blobId).then(() => {
              pull(
                server.blobs.get(blobId),
                pull.collect(function (err, values) {
                  if (err) throw err
                  const code = values.join('')
                  showSource((msg.value.content.name || msg.value.content.mentions[0].name), code)
                }))
                server.close()
            });
          })
        })
        controller.addEventListener('like', async () => {
          try {
            console.log(await getVotes(msg.keys));
          } catch (e) {
            console.log('error', e);
          }
          return true
        })
        controller.addEventListener('unlike', () => {
          vote(msg.key, 0)
        })
      }, function (end) {
        console.log("ending with " + end);
      }));
      server.close()
    }
  });
})

function showSource(name, code) {
  const outer = document.createElement('div')
  outer.id = 'outer'
  const oldTop = window.scrollY
  const oldLeft = window.scrollX
  window.scroll(0,0)
  document.body.classList.add('modal-open')
  document.body.appendChild(outer)
  const inner = document.createElement('div')
  inner.id = 'inner'
  outer.appendChild(inner)

  const header = document.createElement('div')
  inner.appendChild(header)
  header.classList.add('header')
  header.innerText = 'View source: '+name

  const main = document.createElement('div')
  inner.appendChild(main)
  main.classList.add('main')
  const pre = document.createElement('pre')
  main.appendChild(pre)
  const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
  pre.innerHTML = html

  const footer = document.createElement('div')
  inner.appendChild(footer)
  footer.classList.add('footer')
  const closebtn = document.createElement('button')
  footer.appendChild(closebtn)
  closebtn.innerText = 'Close'

  const close = () => {
    document.body.removeChild(outer)
    document.body.classList.remove('modal-open')
    window.scroll(oldLeft, oldTop)
  }

  outer.addEventListener('click', close)
  closebtn.addEventListener('click', close)
  inner.addEventListener('click', (event) => {
    event.stopPropagation()
  })
}

class AppController extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const appDescription = this.msg.value;
    this.classList.add('block', 'app')
    const controllerArea = this.attachShadow({ mode: 'open' });
    controllerArea.innerHTML = `
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

          .hidden {
            display: none
          }
        </style>
        <div class="app">
          <h2>${appDescription.content.name || appDescription.content.mentions[0].name || appDescription.content.comment || ''}</h2>
          <div class="comment">${appDescription.content.comment || ''}</div>
          <div class="author"><code>${appDescription.author}</code></div>
          <div class="time">${(new Date(appDescription.timestamp)).toISOString() || ''}</div>
          <div class="action">
          <button id="run">Run</button>
          <button id="source">View Source</button>
          <button id="like" class="hidden">Add to my apps</button>
          <button id="unlike">Remove from my apps</button>
          </div></div>`
    
    getOwnVote().then(liked => {
      if (liked) {
        controllerArea.getElementById('like').classList.add('hidden')
        controllerArea.getElementById('unlike').classList.remove('hidden')
      } else {
        controllerArea.getElementById('like').classList.remove('hidden')
        controllerArea.getElementById('unlike').classList.add('hidden')
      }
    }, e => {
      console.log("error getting own vote:", e)
    })
    
    getSelfAssignedName(appDescription.author).then(name => {
      const authorElem = controllerArea.querySelector('.author');
      authorElem.innerHTML = name + " (<code class='small'>" + appDescription.author + "</code>)";
    }).catch(e => console.log(e));
    
    controllerArea.getElementById('run').addEventListener('click', () => {
      this.dispatchEvent(new Event('run'));
    })
    controllerArea.getRootNode().getElementById('source').addEventListener('click', () => {
      this.dispatchEvent(new Event('view-source'));
    })
    controllerArea.getRootNode().getElementById('like').addEventListener('click', async () => {
      await vote(this.msg.key, 1)
      this.dispatchEvent(new Event('like'))
      controllerArea.getElementById('like').classList.add('hidden')
        controllerArea.getElementById('unlike').classList.remove('hidden')
    })
    controllerArea.getRootNode().getElementById('unlike').addEventListener('click', async () => {
      await vote(this.msg.key, 0)
      this.dispatchEvent(new Event('unlike'))
      controllerArea.getElementById('like').classList.remove('hidden')
      controllerArea.getElementById('unlike').classList.add('hidden')
    })
  }
}

customElements.define("app-controller", AppController);