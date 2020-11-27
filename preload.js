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

  /*
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  if (process.env.ssb_appname) {
    replaceText(`app_name`, 'SSB App: '+process.env.ssb_appname+'.')
  } 
  */

  document.getElementById('toggle-info').addEventListener('click', (e) => {
    e.preventDefault;
    document.getElementById('info').classList.toggle('hidden')
  })
  document.getElementById('toggle-apps').addEventListener('click', (e) => {
    e.preventDefault;
    document.getElementById('apps-area').classList.toggle('hidden')
  })
  const ssbHost = window.location.host
  const remote = 'ws://'+ssbHost+'~shs:'+window.serverPubKey
  console.log('remote: ', remote)
  ssb({
    remote
  }, (err, sbot) => {
    const view = document.getElementById('view')
    if (err) {
      const warningArea = document.createElement('div')
      warningArea.classList.add('warning')
      warningArea.classList.add('block')
      const clientId = JSON.parse(localStorage['/.ssb/secret']).id
      document.getElementById('info').classList.add('hidden')
      if (err.message.startsWith('method:manifest')) {
        const instructions = `
        <p>
        It appears that access to the SSB Sever running on ${ssbHost} has not yet been granted to this web location and this browser.
        </p>
        <p>
        Copy the public key <code>${clientId}</code> and put it into your <code>~/.ssb/config</code>
        as an item in a top-level array property called “master”, like this:
        </p>
        <pre>
        "master": [
          "${clientId}"
        ],</pre>
        <p>After adding the key you'll need to restart the server.</p>`.replaceAll('\n        ','\n')
        warningArea.innerHTML = instructions
      } else {
        warningArea.innerText = err.message
      }
      view.appendChild(warningArea)
      console.log('could not get keys, got err', err);
    }
    else {
      const votesManager = new VotesManager(sbot)
      const appsArea = document.getElementById('apps-area')
      const shadowView = view.attachShadow({ mode: 'closed' });
      const shadowHtml = document.createElement('html')
      shadowView.appendChild(shadowHtml)
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
      appsArea.innerHTML = `<label><input type="checkbox" id="showLiked" />Show only apps I like</label>`
      const appsGrid = document.createElement('div')
      appsGrid.id = 'apps'
      appsArea.appendChild(appsGrid)

      const showLikedcheckbox = document.getElementById('showLiked')
      showLikedcheckbox.addEventListener('change', (e) => {
        if (showLikedcheckbox.checked) {
          appsGrid.classList.add('show-only-liked')
        } else {
          appsGrid.classList.remove('show-only-liked')
        }

      })
      
      let headObserver = null;

      pull(sbot.query.read(opts), pull.drain(function (msg) {
        if (!msg.value) {
          return;
        }
        if (msg.value.content.type !== 'patchboot-app') {
          throw "unexpected type"
        }
        ensureNotRevoked(sbot, msg).then(() => {
          const controller = document.createElement('app-controller');
          controller.msg = msg
          controller.sbot = sbot
          appsGrid.append(controller);
          const blobId = msg.value.content.link || msg.value.content.mentions[0].link;
          controller.addEventListener('run', () => {
            sbot.blobs.want(blobId).then(() => {
              pull(
                sbot.blobs.get(blobId),
                pull.collect(function (err, values) {
                  if (err) throw err
                  document.getElementById('title-ext').innerHTML = ' - Running: ' + (msg.value.content.name || msg.value.content.mentions[0].name);
                  const code = values.join('')
                  window.setTimeout(() => {
                    const outerHead = document.getElementsByTagName('head')[0]
                    const config = { attributes: false, childList: true, subtree: false }
                    const callback = function (mutationsList, observer) {
                      mutationsList.forEach(mutation => {
                        mutation.addedNodes.forEach(n => shadowHtml.getElementsByTagName('head')[0].appendChild(n))
                      })
                    }
                    if (headObserver) {
                      headObserver.disconnect()
                    }
                    headObserver = new MutationObserver(callback);
                    headObserver.observe(outerHead, config);
                    const fun = new Function('document','root', 'ssb', 'sbot', 'pull', code);
                    shadowHtml.innerHTML = '';
                    shadowHtml.createElement = document.createElement
                    fun(document, shadowHtml.getElementsByTagName('body')[0], ssb, sbot, pull);
                  }, 0)
                }))
            });
          });
          controller.addEventListener('view-source', () => {
            sbot.blobs.want(blobId).then(() => {
              pull(
                sbot.blobs.get(blobId),
                pull.collect(function (err, values) {
                  if (err) throw err
                  const code = values.join('')
                  showSource((msg.value.content.name || msg.value.content.mentions[0].name), code)
                }))
            })
          })
          controller.addEventListener('like', async () => {
            try {
              console.log(await votesManager.getVotes(msg.key));
            } catch (e) {
              console.log('error', e);
            }
            return true
          })
          controller.addEventListener('unlike', () => {
            //vote(msg.key, 0)
          })
        }).catch(() => {})
      }));
    }
  });
})

function ensureNotRevoked(sbot,msg) {
  return new Promise((resolve,reject) => {
    const options = {
      reverse: true,
      query: [
        {
          $filter: {
            value: {
              content: { 
                about: msg.key,
                type: 'about',
                status: 'revoked'
              }
            }
          }
        }
      ],
      limit: 1
    }
    pull(sbot.query.read(options), pull.collect((err, revocations) => {
      if (err) {
        reject(err)
      } else {
        if (revocations.length > 0) {
          reject()
        } else {
          resolve()
        }
      }
    }))
  })
}