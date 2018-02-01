/**
 * Created by Erik on 4/12/17.
 */
/* eslint no-eval: 0 */
import axios from 'axios'
import steemApi from './steemAPI'
import Promise from 'bluebird'

console.log(steemApi)
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
    return axios.get('v1/game?type=audit').then(response => {
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
    return axios.post('v1/post', activity)
  }

  updateActivity (gameId, activity) {
    return axios.put('v1/post', {'gameId': gameId, 'activity': activity})
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
        // steamApi.getContentRepliesAsync(/*activity.account*/'steemitgame.test', activity.permlink).then(response => {
        steemApi.getContentRepliesAsync('steemitgame.test', activity.permlink).then(response => {
          console.log('## content replies ###', activity.title)
          console.log(response)
          result.comments = response
        })

        this.getComments('', 'steemitgame.test', activity.permlink).then(comments => {
          result.comments = comments
        })
      }
      if (activity.status !== 0) {
        // already closed, get award directly from backend data
        result.totalAward += activity.award
      } else {
        // promises.push(steamApi.getContentAsync(/*activity.account*/'steemitgame.test', activity.permlink).then(response => {
        promises.push(steemApi.getContentAsync('steemitgame.test', activity.permlink).then(response => {
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
          if (response.active_votes && response.active_votes.length > 0) {
            result.activeVotes = result.activeVotes.concat(response.active_votes)
          }
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

  getComments (category, author, permlink) {
    return steemApi.getStateAsync(`/${category}/@${author}/${permlink}`).then(apiRes => ({
      rootCommentsList: this.getRootCommentsList(apiRes),
      commentsChildrenList: this.getCommentsChildrenLists(apiRes),
      content: apiRes.content
    }))
  }

  getCommentsChildrenLists = (apiRes) => {
    const listsById = {}
    Object.keys(apiRes.content).forEach((commentKey) => {
      listsById[apiRes.content[commentKey].id] = apiRes.content[commentKey].replies.map(
        childKey => apiRes.content[childKey].id
      )
    })
    return listsById
  }

  getRootCommentsList (apiRes) {
    return Object.keys(apiRes.content)
      .filter(commentKey => apiRes.content[commentKey].depth === 1)
      .map(commentKey => apiRes.content[commentKey].id)
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
      try {
        gameJson.coverImage = JSON.parse(gameJson.coverImage)
      } catch (error) {
        gameJson.coverImage = {}
      }
    }
    if (gameJson.gameUrl) {
      try {
        gameJson.gameUrl = JSON.parse(gameJson.gameUrl)
      } catch (error) {
        gameJson.gameUrl = {}
      }
    }
    if (gameJson.activities == null) {
      gameJson.activities = []
    }
    return gameJson
  }

  convertGameToJson (game) {
    let clonnedGame = Object.assign({}, game)
    clonnedGame.coverImage = JSON.stringify(game.coverImage)
    clonnedGame.gameUrl = JSON.stringify(game.gameUrl)
    delete clonnedGame.activities
    return clonnedGame
  }
}
