/**
 * Created by Erik on 4/12/17.
 */
import GameList from '../mocks/gameListMock'
import axios from 'axios'
import steemAPI from 'steem'
import Promise from 'bluebird'

const getContentAsyc = Promise.promisify(steemAPI.getContent, {
  context: steemAPI
})

export default class GameService {
  create (game) {
    return axios.post('/v1/game', game).then(response => {
      return response.data
    })
  }

  list () {
    return new Promise((resolve, reject) => {
      resolve(GameList)
    })
    // return axios.get('v1/game?type=index')
  }

  delete (id) {
    return axios.delete('/v1/game/' + id)
  }

  update (game) {
    return axios.put('v1/game' + game.id, game)
  }

  getById (id) {
    // return axios.get('/v1/game/' + id).then(response => {
    //   return response.data
    // })
    return new Promise((resolve, reject) => {
      let games = GameList.items.filter((game) => {
        return '' + game.id === id
      })
      if (games.length > 0) {
        resolve(games[0])
      } else {
        reject(new Error('cannot find the game'))
      }
    })
  }

  getMyGames (userId) {
    return axios.get('/v1/game?account=' + userId)
  }

  getTopRateGames () {
    return axios.get('/v1/game?sortby=')
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
  // fetchSteemitData (game) {
  //   let promises = []
  //   let result = {
  //     totalAward: 0,
  //     upVotes: []
  //   }
  //
  //   for (let i = 0; i < game.activities.length; i++) {
  //     let activity = game.activities[i]
  //     // currently only display the comment on the latest post
  //     if (i === game.activities.length - 1) {
  //       result.comments = activity.comments
  //     }
  //     if (activity.status !== 0) {
  //       // already closed, get award directly from backend data
  //       result.totalAward += activity.award
  //     } else {
  //       promises.push(getContentAsyc(game.author, activity.permlink).then(response => {
  //         result.totalAward += response.award
  //         // result.upVotes.push(response.votes)
  //       }))
  //     }
  //   }
  //
  //   return Promise.all(promises).then(() => {
  //     return result
  //   })
  // }
}
