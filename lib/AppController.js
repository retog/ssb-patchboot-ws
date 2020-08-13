const {VotesManager} = require('./VotesManager.js')
const { IdentityManager } = require('./IdentityManager.js')

class AppController extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const appDescription = this.msg.value;
    const votesManager = new VotesManager(this.sbot)
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

          header {
            display: flex;
          }

          header > h2 {
            display: flex;
            flex: 1;
          }

          header > div.meta {
            margin-right: 1em; 
            display: flex;
            flex-direction: column;
            align-items: flex-end;            
          }

          #counts > a.likes::before {
            content: '❤ ';
            color: #ff2f92;
          }

          header a {
              text-decoration: none;
              color: #286bc3;
          }
        </style>
        <div class="app">
          <header>
            <h2>${appDescription.content.name || appDescription.content.mentions[0].name || appDescription.content.comment || ''}</h2>
            <div class="meta">
            <div id="counts"></div>
            </div>
          </header>
          <div class="comment">${appDescription.content.comment || ''}</div>
          <div class="author"><code>${appDescription.author}</code></div>
          <div class="time">${(new Date(appDescription.timestamp)).toISOString() || ''}</div>
          <div class="action">
          <button id="run">Run</button>
          <button id="source">View Source</button>
          <button id="like" class="hidden">Like</button>
          <button id="unlike" class="hidden">Unlike</button>
          </div></div>`

    const renderLikesStuff = () => {
      votesManager.getVotes(this.msg.key).then(likes => {
        const count = likes.length
        if (count > 0) {
          controllerArea.getElementById('counts').innerHTML = `<a class="likes" href="#">${count} like</a>`
        } else {
          controllerArea.getElementById('counts').innerHTML = ``
        }
      })
      
      votesManager.getOwnVote(this.msg.key).then(liked => {
        if (liked) {
          this.classList.add('liked')
          controllerArea.getElementById('like').classList.add('hidden')
          controllerArea.getElementById('unlike').classList.remove('hidden')
        } else {
          this.classList.remove('liked')
          controllerArea.getElementById('like').classList.remove('hidden')
          controllerArea.getElementById('unlike').classList.add('hidden')
        }
      }, e => {
        console.log("error getting own vote:", e)
      })
    }
    renderLikesStuff()
    
    ;(new IdentityManager(this.sbot)).getSelfAssignedName(appDescription.author).then(name => {
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
      renderLikesStuff()
      this.dispatchEvent(new Event('like'))
    })
    controllerArea.getRootNode().getElementById('unlike').addEventListener('click', async () => {
      await votesManager.vote(this.msg.key, 0)
      renderLikesStuff()
      this.dispatchEvent(new Event('unlike'))
    })
  }
}

customElements.define("app-controller", AppController);