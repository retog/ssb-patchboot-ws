const ssb = require('ssb-client')
const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')

function vote(id, value) {
  return new Promise((resolve, reject) => {
    ssb((err, server) => {
      if (err) {
        reject(err)
      }
      server.publish({
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
          server.close()
      })
    })
  })
}

function getVotes(id) {

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
    ssb((err, server) => {
      if (err) reject(err)
      pull(
        server.query.read(opts),
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
          server.close();
        })
      )
    })
  })

  return votesMapPromises.then(votesMap => votesMap.entries())
    .then(entries => [...entries].filter(mapping => mapping[1] > 0))
    .then(filtered => filtered.map(tuple => tuple[0]))
} 

function getOwnVote(msgID) {
  return new Promise((resolve, reject) => {
    ssb((err, server) => {
      if (err) {
        reject(err)
        return
      }
      server.whoami().then(thisisme => {
        server.close()
        const feedID = thisisme.id
        return getVotes(msgID).then(votes => {
          resolve(votes.indexOf(feedID) > -1)
        })
      }).catch(reject)
    })
  })
}




module.exports = {vote, getVotes, getOwnVote}