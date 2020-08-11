const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')

class VotesManager {

  constructor(server) {
    this.server = server
  }

  vote(id, value) {
    return new Promise((resolve, reject) => {
      this.server.publish({
        type: 'vote',
        vote: {
          'link': id,
          value,
          expression: value ? 'Like' : 'Unlike'
        }
      }, function (err, msg) {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  }

  getVotes(id) {

    const opts = {
      reverse: false,
      query: [{
        $filter: {
          value: {
            content: {
              type: 'vote',
              vote: {
                link: id
              }
            }
          }
        }
      },
      {
        $map: {
          author: ['value', 'author'],
          value: ['value', 'content', 'vote', 'value']
        }
      }]
    }

    const votesMapPromises = new Promise((resolve, reject) => {
      const votes = new Map();
      pull(
        this.server.query.read(opts),
        /*pull.drain((msg) => {
          votes.set(msg.author, msg.value)
        },
        () => {
          resolve(votes);
        })*/
        pull.collect((err, msgs) => {
          if (err) {
            reject(err)
          } else {
            msgs.forEach(msg => {
              //console.log('msg', msg)
              votes.set(msg.author, msg.value)
            });
            resolve(votes);
          }
        })
      )
    })

    return votesMapPromises.then(votesMap => votesMap.entries())
      .then(entries => [...entries].filter(mapping => mapping[1] > 0))
      .then(filtered => filtered.map(tuple => tuple[0]))
  }

  getOwnVote(msgID) {
    return new Promise((resolve, reject) => {
        this.server.whoami().then(thisisme => {
          const feedID = thisisme.id
          return this.getVotes(msgID).then(votes => {
            resolve(votes.indexOf(feedID) > -1)
          })
        }).catch(reject)
    })
  }

}

module.exports = { VotesManager }