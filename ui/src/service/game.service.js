/**
 * Created by Erik on 4/12/17.
 */
/* eslint no-eval: 0 */
import axios from 'axios'
import steamApi from './steemAPI'
import Promise from 'bluebird'

console.log(steamApi)
// export const getContentAsyc = Promise.promisify(steamApi.getContent, {
//   context: steamApi
// })

export default class GameService {
  create (game) {
    return axios.post('/v1/game', this.convertGameToJson(game)).then(response => {
      return this.convertJsonToGame(response.data)
    })
  }

  list () {
    // return new Promise((resolve, reject) => {
    //   resolve(GameList)
    // })
    return axios.get('v1/game?type=index').then(response => {
      return this.handleResponse(response)
    })
  }

  delete (id) {
    return axios.delete('/v1/game/' + id)
  }

  update (game) {
    return axios.put('v1/game' + game.id, game)
  }

  getById (id) {
    return axios.get('/v1/game/' + id).then(response => {
      return this.convertJsonToGame(response.data)
    })
    // return new Promise((resolve, reject) => {
    //   let games = GameList.items.filter((game) => {
    //     return '' + game.id === id
    //   })
    //   if (games.length > 0) {
    //     resolve(games[0])
    //   } else {
    //     reject(new Error('cannot find the game'))
    //   }
    // })
  }

  getMyGames (userId) {
    return axios.get('/v1/game?account=' + userId)
  }

  getTopRateGames () {
    return axios.get('/v1/game?sort=rate_desc')
  }

  query (params) {
    return axios.get('v1/game', {
      params: params
    })
  }

  createActivity (gameId, activity) {
    return axios.post('v1/activity', {'gameId': gameId, 'activity': activity})
  }

  updateActivity (gameId, activity) {
    return axios.put('v1/activity', {'gameId': gameId, 'activity': activity})
  }

  /**
   * Read <code> activities </code> Array and get award data from steemit for each of them
   * Then combine them together
   * @param game
   */
  fetchSteemitData (game) {
    console.log('fetchSteemitData')
    let promises = []
    let result = {
      totalAward: 0,
      activeVotes: [],
      comments: [],
      tags: []
    }

    for (let i = 0; i < game.activities.length; i++) {
      let activity = game.activities[i]
      // currently only display the comment on the latest post
      if (i === game.activities.length - 1) {
        // result.comments = activity.comments
        steamApi.getContentRepliesAsync(activity.account, activity.permlink).then(response => {
          console.log('## content replies ###', activity.title)
          console.log(response)
          result.comments = response
        })
      }
      if (activity.status !== 0) {
        // already closed, get award directly from backend data
        result.totalAward += activity.award
      } else {
        promises.push(steamApi.getContentAsync(activity.account, activity.permlink).then(response => {
          console.log('get data for content: ' + activity.permlink, response)
          if (response.json_metadata) {
            let metadata = JSON.parse(response.json_metadata)
            if (metadata && metadata.tags) {
              if (metadata.tags instanceof Array) {
                result.tags = result.tags.concat(eval(metadata.tags))
              } else if (typeof metadata.tags === 'string') {
                // when there is only one tag, seems it returns a string
                result.tags.push(metadata.tags)
              }
            }
          }
          result.totalAward += Number.parseFloat(response.pending_payout_value ? response.pending_payout_value.replace(' SBD') : 0)
          result.activeVotes.push(response.active_votes)
        }))

        // promises.push(axios.get('https://api.steemjs.com/get_content', {author: activity.account, permlink: activity.permlink}).then(response => {
        //   console.log('get data for content: ' + activity.permlink, response)
        //   if (response.json_metadata) {
        //     let metadata = JSON.parse(response.json_metadata)
        //     if (metadata && metadata.tags) {
        //       result.tags.push(metadata.tags)
        //     }
        //   }
        //   result.totalAward += Number.parseFloat(response.pending_payout_value.replace(' SBD'))
        //   result.activeVotes.push(response.active_votes)
        // }))
      }
    }

    return Promise.all(promises).then(() => {
      return result
    })
  }

  handleResponse (response) {
    let data = response.data
    if (data.items) {
      // it is a list
      for (let i = 0; i < data.items.length; i++) {
        this.convertJsonToGame(data.items[i])
      }
    } else {
      this.convertJsonToGame(data)
    }
    console.log(data)
    return data
  }

  convertJsonToGame (gameJson) {
    if (gameJson.coverImage) {
      gameJson.coverImage = JSON.parse(gameJson.coverImage)
    }
    if (gameJson.gameUrl) {
      gameJson.gameUrl = JSON.parse(gameJson.gameUrl)
    }
    return gameJson
  }

  convertGameToJson (game) {
    let clonnedGame = Object.assign({}, game)
    clonnedGame.coverImage = JSON.stringify(game.coverImage)
    clonnedGame.gameUrl = JSON.stringify(game.gameUrl)
    return clonnedGame
  }
}
