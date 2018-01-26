<template>
  <div>
    <common-header></common-header>
    <div>
      <img :src="game.coverImg" class="game-cover-image"/>
      <!--<iframe msallowfullscreen="true" allowfullscreen="true" id="game_drop" frameborder="0" :src="game.gameIndex" scrolling="no" allowtransparency="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>    </div>-->
    </div>
    <div>
      <span class="like">
        <i class="fa fa-heart" aria-hidden="true"></i>55
      </span>
      <span class="author">
        Author: {{game.account}}
      </span>
      <span class="author">
        Type: {{game.category}}
      </span>
    </div>
    <h2>Game Description: </h2>
    <p>
      {{ game.desc }}
    </p>
    <div>
      <span>Tags: </span> <span v-for="tag in game.tags">{{tag}}</span>
    </div>

    <div v-if="similarGames.length > 0">
      <div>
        <h2>Other similar games</h2>
      </div>
      <game-list :query="{category: game.category}"></game-list>
    </div>
  </div>
</template>
<script>
  import CommonHeader from '../common/CommonHeader'
  import GameList from '../shared/GameList'
  import GameService from '../../service/game.service'

  const gameService = new GameService()
  export default {
    components: {
      GameList,
      CommonHeader},
    data () {
      return {
        isAuditMode: false,
        similarGames: [],
        game: {}
      }
    },
    props: ['id'],
    mounted () {
      gameService.getById(this.id).then(response => {
        this.game = response
      })
    }
  }
</script>
<style>

</style>
