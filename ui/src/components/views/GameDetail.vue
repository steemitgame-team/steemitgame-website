<template>
  <div>
    <el-container>
      <el-header>
        <common-header></common-header>
      </el-header>
      <el-container>
        <el-main>
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <div class="gamePlayer">
                <!--<img :src="game.coverImg" class="game-cover-image"/>-->
                <!--<iframe msallowfullscreen="true" allowfullscreen="true" id="game_drop" frameborder="0" :src="game.gameIndex" scrolling="no" allowtransparency="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>    </div>-->
                game area
              </div>
              <div class="gameInfo">
                <div class="gameTitle">
                  {{game.title}}
                </div>
                <div class="gameMetadata">
                  <span class="modifiedTime">{{postedTime}}</span>
                  <span class="totalAward">${{metadata.totalAward}}</span>
                  <span class="activeVotes">
                    <i class="fa fa-thumbs-o-up" aria-hidden="true"></i> {{votes}}
                  </span>
                  <span class="type">
                    Type: {{game.category}}
                  </span>
                </div>
                <div class="gameTags">
                  <span v-for="tag in metadata.tags" class="gameTag">{{tag}}</span>
                </div>
                <div class="authorInfo">
                  <div class="avatar" :style="'background-image: url(https://steemitimages.com/u/' + this.game.account + '/avatar'"></div>
                  <div class="accountName"><a :href="'https://steemit.com/@' + game.account" target="_blank">{{game.account}}</a></div>
                </div>
                <div class="description" v-html="compiledDescription">
                </div>
                <div class="comments">
                  <div v-for="comment in metadata.comments">
                    {{comment.author}} : {{comment.body}} : {{comment.active_votes.length}} : {{comment.pending_payout_value}}
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :lg="4" :xl="4" class="hidden-md-and-down">
              <div class="similarGame">
                <div v-if="similarGames.length > 0">
                  <div class="similarGameTitle">
                    You may also like
                  </div>
                  <game-list :items="similarGames"></game-list>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
      <el-footer>
        <common-footer></common-footer>
      </el-footer>
    </el-container>
  </div>
</template>
<script>
  import CommonHeader from '../common/CommonHeader'
  import CommonFooter from '../common/CommonFooter.vue'
  import GameList from '../shared/GameList'
  import GameService from '../../service/game.service'
  import mockData from '../../mocks/gameListMock'
  import moment from 'moment'
  import marked from 'marked'
  const gameService = new GameService()

  export default {
    components: {
      GameList,
      CommonHeader,
      CommonFooter
    },
    data () {
      return {
        isAuditMode: false,
        similarGames: mockData.items,
        game: {},
        metadata: {},
        userInfo: {}
      }
    },
    props: ['id'],
    computed: {
      compiledDescription () {
        return marked(this.game.description, { sanitize: true })
      },
      postedTime () {
        return moment(this.game.lastModified, 'x').fromNow()
      },
      userIcon () {
        return 'background-image: url(https://steemitimages.com/u/' + this.game.account + 'bizheng/avatar'
      },
      votes () {
        return this.metadata && this.metadata.activeVotes ? this.metadata.activeVotes.length : 0
      }
    },
    methods: {
    },
    mounted () {
      if (this.id) {
        gameService.getById(this.id).then(response => {
          this.game = response
          console.log('mounted successfully', this.game)
          gameService.fetchSteemitData(this.game).then(response => {
            console.log('get steem data', response)
            this.metadata = response
          })
        })
      }
    }
  }
</script>
<style lang='scss' scoped>
  .similarGameTitle {
    font-size: 20px;
    font-weight: bold;
  }

  .gamePlayer {
    background-color: #00B6FF;
    height: 400px;
    padding: 20px;

  }

  .gameInfo {
    padding: 10px;
  }
  .gameTags {
    margin: 20px 0;
    display: flex;
    .gameTag {
      display: inline;
      margin-right: 12px;
      /*line-height: 32px;*/
      padding: 4px 6px;
      background: rgba(94,109,130,.1);
      border: 1px solid rgba(94,109,130,.2);
      border-radius: 4px;
      color: #5e6d82;
      float: left;
    }
  }

  .gameMetadata {
    height: 30px;
    line-height: 30px;
    span {
      padding-left: 20px;
    }

    .activeVotes {
      float: right;
    }

    .modifiedTime {
      float: left;
    }

    .totalAward {
      float: right;
    }

    .type {
      float: left;
    }
  }

  .authorInfo {
    display: flex;
    .avatar {
      vertical-align: top;
      display: inline-block;
      margin-right: 25px;
      height: 36px;
      width: 36px;
      cursor: pointer;
      background-size: cover;
      backgroud-repeat: no-repeat;
      backgroud-position: 50% 50%;
      border-radius: 50%;
    }
    .accountName {
      line-height: 36px;
    }
  }



</style>
