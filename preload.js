const ssb = require('ssb-client')

window.remoteSsbConnect = () => new Promise((resolve, reject) => {
  const ssbHost = window.location.hostname+':'+window.ssbPort
  const ssbBaseUri = window.ssbBaseUri || 'ws://'+ssbHost
  const remote = ssbBaseUri+'~shs:'+window.serverPubKey
  ssb({
    remote
  }, (err, sbot) => {
    if (err) {
      const warningArea = document.createElement('div')
      warningArea.classList.add('warning')
      warningArea.classList.add('block')
      const clientId = JSON.parse(localStorage['/.ssb/secret']).id
      //document.getElementById('info').classList.add('hidden')
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
      document.body.innerHTML = ''
      document.body.appendChild(warningArea)
      console.log('could not get keys, got err', err);
      reject(err)
    } else {
      resolve(sbot)
    }
  });
})