const html = (name, comment, script) => `
<html>
  <style>
  * {
    box-sizing: border-box;
    overflow-wrap: anywhere;
  }

  #content {
    margin: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: #ffffff;
  }
  
  #run-area {
    background: #ffffff;
    border: 1px solid #b0bec5;
    border-radius: 0.5rem;
    margin: 0.5rem;
    padding: 0.5rem;
  }  
  </style>
  <body>
    <div id="content">
      <label>Name</label>:<input type="text" id="name" value="${name}"/><br/>
      <label>Comment</label>:<input type="text" id="comment" value="${comment}"/><br/>
      <label>Script</label>:<br/>
      <textarea id='script' rows='12' style='width: 100%'>${script}</textarea><br/>
      <button id="run">Run</button>
      <button id="save">Save</button>
      <div id="run-area" style="display: none"/>
    </div>
  </body>
</html>
`;
root.innerHTML = html('', '',
`// root points to the DOM shadow root element
// sbot to the connect to the Scuttlebutt server
// pull to pull-stream`);
const run = root.querySelector('#run');
const save = root.querySelector('#save');
const name = root.querySelector('#name');
const comment = root.querySelector('#comment');
const script = root.querySelector('#script');
const runArea = root.querySelector('#run-area');
const shadowRunArea = runArea.attachShadow({mode: 'closed'});
run.addEventListener('click', () => {
  console.log('name: ',name.value,comment.value,script.value)
  runArea.style.display = 'block';
  const fun = new Function('root', 'ssb', 'sbot', 'pull', script.value);
  shadowRunArea.innerHTML = '';
  fun(shadowRunArea, ssb, sbot, pull);
})
save.addEventListener('click', () => {
  if (name.value.trim() === '') {
    alert('The name must not be empty')
    return;
  }
  if (!confirm("Publish App Irrevocably.")) {
    return;
  }

  pull(pull.values([script.value]), sbot.blobs.add(undefined, function (err, hash) {
    sbot.publish({
        type: 'patchboot-app',
        name: name.value,
        comment: comment.value,
        link: hash
    }, function (err, msg) {
        if (err) {
          throw err;
        }
    });
  }));
})
