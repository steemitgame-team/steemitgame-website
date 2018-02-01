<template>
  <div>
    <el-row>
      <el-col :xs="8" :sm="8" :md="2" :lg="2" :xl="2">
        <avatar :accountName="comment.author"></avatar>
      </el-col>
      <el-col :xs="16" :sm="16" :md="22" :lg="22" :xl="22">
        <div class="commentWrapper">
          <div class="commentAuthor">
            <span class="author">{{comment.author}}</span>
            <span class="time">{{lateUpdate}}</span>
          </div>
          <div class="body">
            {{comment.body}}
          </div>
          <div class="metadata">
            <span class="votes">
              <i class="fa fa-thumbs-o-up" aria-hidden="true" @click="voteUp()"></i> {{votesCount}}
            </span>
            <span class="award">${{comment.pending_payout_value}}</span>
            <span class="reply">
                <el-button type="text" :disabled="!canVote()">Reply</el-button>
            </span>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import Avatar from './Avatar'
  import SteemService from '../../service/steem.service'
  import moment from 'moment'

  const steemService = new SteemService()
  export default {
    components: {
      Avatar
    },
    props: ['comment', 'author'],
    name: 'Comment',
    data () {
      return {
        votesCount: 0,
        alreadyVotes: false
      }
    },
    methods: {
      voteUp () {
        if (this.canVote()) {
          steemService.vote(this.author, this.comment.permlink)
          // assume it vote successfully
          this.votesCount++
        }
      },

      canVote () {
        return true
      }
    },
    computed: {
      thumbnail () {
        return 'http://ipfs.io/ipfs/' + this.game.coverImage.hash
      },

      votes () {
        return this.comment.active_votes.map(votes => {
          return votes.author
        })
      },

      lateUpdate () {
        return moment(this.comment.last_update).fromNow()
      }
    },
    mounted () {
      this.votesCount = this.comment.active_votes ? this.comment.active_votes.length : 0
    }
  }
</script>
<style lang="scss">
  .commentWrapper {
    div {
      display: flex;
    }

    .commentAuthor {
      .author {
        font-weight: bold;
        font-size: 15px;
      }
      .time {
        margin-left: 15px;
      }
    }
    .body {
      margin-top: 10px;
      font-size: 14px;
    }

    .metadata {
      margin-top: 5px;
      line-height: 40px;
      .award {
        margin-left: 10px;
      }
      .reply {
        margin-left: 10px;
      }
    }

  }
</style>
