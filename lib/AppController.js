const {VotesManager} = require('./VotesManager.js')
const { IdentityManager } = require('./IdentityManager.js')

class AppController extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const appDescription = this.msg.value;
    const votesManager = new VotesManager(this.server)
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
    
    votesManager.getOwnVote(this.msg.key).then(liked => {
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
    
    ;(new IdentityManager(this.server)).getSelfAssignedName(appDescription.author).then(name => {
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
      await votesManager.vote(this.msg.key, 1)
      this.dispatchEvent(new Event('like'))
      controllerArea.getElementById('like').classList.add('hidden')
        controllerArea.getElementById('unlike').classList.remove('hidden')
    })
    controllerArea.getRootNode().getElementById('unlike').addEventListener('click', async () => {
      await votesManager.vote(this.msg.key, 0)
      this.dispatchEvent(new Event('unlike'))
      controllerArea.getElementById('like').classList.remove('hidden')
      controllerArea.getElementById('unlike').classList.add('hidden')
    })
  }
}

customElements.define("app-controller", AppController);