const pull = require('pull-stream')
pull.paraMap = require('pull-paramap')

class IdentityManager {

  constructor(server) {
    this.server = server
  }
  /** returns a promise for the self-assigned name of the user */
  getSelfAssignedName(id) {
    const opts = {
      reverse: true,
      limit: 1,
      query: [{
        $filter: {
          value: {
            author: id,
            content: {
              type: 'about',
              about: id,
              name: { $is: 'string' }
            }
          }
        }
      },
      {
        $map: {
          name: ['value', 'content', 'name']
        }
      }]
    }
    return new Promise((resolve, reject) => {
      pull(
        this.server.query.read(opts),
        pull.collect((err, data) => {
          if (err) {
            reject(err);
          } else {
            if (data.length > 0) {
              resolve(data[0].name)
            } else {
              reject('the user hasn\'t assigned a name to themself yet');
            }
          }
        })
      )
    })
  }
}

module.exports.IdentityManager = IdentityManager