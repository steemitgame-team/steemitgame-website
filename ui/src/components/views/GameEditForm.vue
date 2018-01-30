<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-main>
      <div class="editTitle">
        <h1>Create a new game</h1>
      </div>
      <div class="editFormContainer">
        <div class='gameEditForm'>
          <div>
          <el-form ref='game' :rules='rules' :model='game' label-width='150px'>
            <el-form-item label='Game Title' prop="title">
              <el-input v-model='game.title'></el-input>
            </el-form-item>
            <el-form-item label='Game Description' prop="description">
              <!--<el-input v-model='game.description' type="textarea" :rows="2" placeholder="Please input description of your game"></el-input>-->
              <mavon-editor language="en" :subfield="false" v-model='game.description'></mavon-editor>
            </el-form-item>
            <el-form-item label='Cover Image' prop="coverImage">
              <vue-dropzone ref="coverImageDropzone" @vdropzone-success="onImageUploaded" @vdropzone-error="onImageUploadFail" id="dropzone" :options="dropzoneOptions"></vue-dropzone>
              <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </el-form-item>
            <el-form-item label='Game Type' prop="category">
              <el-select v-model="game.category" filterable placeholder="Select">
                <el-option v-for="item in gameTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="File" prop="gameFile">
              <el-upload
                class="game-resource-upload"
                action="/v1/upload"
                :on-remove="onFileRemoved"
                :file-list="game.fileList"
                :on-success="onFileUploaded"
                list-type="text">
                <el-button size="small" type="primary">Click to upload</el-button>
                <div slot="tip" class="el-upload__tip">game files with a size less than 500kb</div>
              </el-upload>
            </el-form-item>
              <el-button type='primary' @click="submitForm('game')">{{ actionText }}</el-button>
              <el-button @click="cancelForm()">Cancel</el-button>
          </el-form>
        </div>
        <div>
          <h3> Create Post in Steemit</h3>
          <el-form ref='activity' :rules='activityRules' :model='activity' label-width='150px'>
            <el-form-item label='Post Content' >
              <el-switch
                         v-model="useGameInfoAsPost"
                         active-text="Use Game Info"
                         inactive-text="Customize">
              </el-switch>
            </el-form-item>
            <a :href="game.permLink" v-if="game.permLink">Open Steemit Post</a>
            <el-form-item label='Activity Title' prop="activityTitle">
              <el-input :disabled="useGameInfoAsPost" v-model='activity.activityTitle'></el-input>
            </el-form-item>
            <el-form-item label='Activity Description' prop="activityDesc">
              <el-input :disabled="useGameInfoAsPost" v-model='activity.activityDesc' type="textarea" :rows="2" placeholder="This will be posted to steemit, game description will be used if empty"></el-input>
            </el-form-item>
            <el-form-item label='Tags'>
              <input-tag :on-change='onTagChange' :tags='activity.tags'></input-tag>
            </el-form-item>
            <el-form-item label="reward">
              <el-slider v-model="activity.reward"></el-slider>
            </el-form-item>
            <el-form-item>
              <el-button type='primary' :disabled="activity.permLink == null" @click="submitActivity(false)">Update</el-button>
              <el-button type='primary' @click="submitActivity(true)">New Post</el-button>
              <el-button @click="cancelForm()">Cancel</el-button>
            </el-form-item>
          </el-form>
        </div>
        </div>
      </div>
    </el-main>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
  import InputTag from 'vue-input-tag'
  import CommonFooter from '../common/CommonFooter'
  import { FormItem, Checkbox,
    CheckboxGroup,
    Form,
    Col,
    Switch,
    Button,
    Radio,
    Input,
    Container,
    Footer,
    Header,
    Main,
    Select,
    Upload,
    RadioGroup,
    Slider
  } from 'element-ui'
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'
  import CommonHeader from '../common/CommonHeader'
  import GameService from '../../service/game.service'
  import ElFormItem from '../../../node_modules/element-ui/packages/form/src/form-item'

  const gameService = new GameService()

  export default {
    components: {
      ElFormItem,
      CommonHeader,
      Checkbox,
      CheckboxGroup,
      Form,
      FormItem,
      Col,
      Switch,
      Button,
      Radio,
      Input,
      Container,
      Footer,
      Header,
      InputTag,
      Select,
      CommonFooter,
      Main,
      Upload,
      RadioGroup,
      Slider,
      vueDropzone: vue2Dropzone
    },
    props: ['id', 'mode'],
    name: 'GameEditForm',
    data () {
      return {
        actionText: 'Create',
        errorMessage: '',
        useGameInfoAsPost: true,
        game: {
          title: '',
          description: '',
          coverImage: null,
          category: '',
          activities: [],
          gameFile: null,
          lastModified: null,
          author: null
        },
        activity: {
          activityTitle: '',
          activityDesc: '',
          permLink: '',
          award: null,
          reward: 100,
          tags: ['abc', 'eef']
        },
        fileList: [],
        rules: {
          title: [
            { required: true, message: 'Please input the game title', trigger: 'blur' },
            { min: 5, max: 255, message: 'Title should between 5 - 255 characters', trigger: 'blur' }
          ],
          description: [
            { required: true, message: 'Please input game description', trigger: 'blur' },
            { max: 3000, message: 'Description max 3000 characters', trigger: 'blur' }
          ],
          category: [
            { required: true, message: 'Please select game type', trigger: 'change' }
          ],
          coverImage: [
            { type: 'object', required: true, message: 'Please upload game image', trigger: 'change' }
          ],
          gameFile: [
            { type: 'object', required: true, message: 'Please upload game file', trigger: 'change' }
          ]
        },
        activityRules: {
          activityTitle: [
            { min: 5, max: 255, message: 'Title should between 5 - 255 characters', trigger: 'blur' }
          ],
          activityDesc: [
            { max: 3000, message: 'Description max 3000 characters', trigger: 'blur' }
          ]
        },
        dropzoneOptions: {
          url: '/v1/upload',
          maxFilesize: 4,
          maxFiles: 1,
          thumbnailWidth: 330,
          addRemoveLinks: true,
          acceptedFiles: 'image/*',
          dictDefaultMessage: "<i class='fa fa-cloud-upload'></i>UPLOAD Cover Image"
        },
        gameTypeOptions: [{
          value: 'Pixel Art',
          label: 'Pixel Art'
        }, {
          value: 'Action',
          label: 'Action'
        }, {
          value: 'Music',
          label: 'Music'
        }, {
          value: 'Shooting',
          label: 'Shooting'
        }]
      }
    },
    methods: {
      submitForm () {
        console.log(this.game)
        this.$refs['game'].validate((valid) => {
          if (valid) {
            console.log('submit')
            console.log(this.game)
            if (this.game.id == null) {
              gameService.create(this.game).then((game) => {
                // pop up success message
                this.game.id = game.id
                this.$alert('Congratulations! Your game has been created', 'Game Created', {
                  confirmButtonText: '确定',
                  callback: action => {
                    // go to my game list view
                  }
                })
              }).catch(error => {
                console.log(error)
                this.$alert('Oops! Something went wrong. Your game cannot be created right now.', 'Game Creation Fail', {
                  confirmButtonText: 'Got it',
                  callback: action => {
                    // go to my game list view
                  }
                })
                this.errorMessage = error.data
              })
            } else {
              gameService.update(this.game).then(() => {
                console.log('game updated successfully.')
              })
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      submitActivity (isNew) {
        if (isNew) {
          if (this.game.id) {
            gameService.createActivity(this.game.id, this.activity).then(activity => {
              this.activity = activity
            }).catch(error => {
              console.log(error)
              this.$message.error('Fail to post message to steemit')
            })
          } else {
            this.$message.error('Please create the game first!')
          }
        } else {
          gameService.createActivity(this.game.id, this.activity).then(activity => {
            this.activity = activity
          }).catch(error => {
            console.log(error)
            this.$message.error('Fail to update the last post on steemit.')
          })
        }
      },

      onTagChange () {
        console.log('tag changed')
      },
      onFileRemoved (file, fileList) {
        console.log(file, fileList)
      },
      onFileUploaded (response, file, fileList) {
        console.log(response)
        console.log(file)
        console.log(fileList)
        this.fileList = [file]
        this.game.gameFile = response[0]
      },
      onImageUploaded (file, response) {
        console.log('file uploaded', response)
        this.game.coverImage = response[0]
      },
      onImageUploadFail (file) {
        console.log('file upload fail')
      }
    },
    mounted () {
      console.log('mounted')
      console.log(this.$refs.coverImageDropzone)
      if (this.$router.id) {
        this.id = this.$router.id
      }
      if (this.id != null) {
        this.activeIndex = 'Update'
        gameService.getById(this.id).then(game => {
          this.game = game
          this.game.coverImage = JSON.parse(game.coverImage)
          this.$refs.coverImageDropzone.dropzone.emit('addedfile', game.coverImage)
          this.$refs.coverImageDropzone.dropzone.options.thumbnail.call(this.$refs.coverImageDropzone, game.coverImage, 'http://gateway.ipfs.io/ipfs/' + game.coverImage.hash)
          this.$refs.coverImageDropzone.dropzone.emit('complete', mockFile)
        }).catch(error => {
          console.log(error)
          this.fileList = [this.game.gameFile]
        })
      }
      let mockFile = { name: 'a.jpg', size: '100000' }
      this.$refs.coverImageDropzone.dropzone.emit('addedfile', mockFile)
      this.$refs.coverImageDropzone.dropzone.options.thumbnail.call(this.$refs.coverImageDropzone, mockFile, 'https://www.adlib-recruitment.co.uk/blog/wp-content/uploads/2015/11/gamepad2.png')
      this.$refs.coverImageDropzone.dropzone.emit('complete', mockFile)
      this.fileList = [{name: 'a.zip', percentage: '100', size: '10000'}]
    }
  }
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
  .game-resource-upload {
  }
  .editFormContainer {
    display: flex;
    justify-content: center;
    .gameEditForm {
      display: flex;
      justify-content: center;
      border: 1px solid gray;
      box-shadow: 2px 2px 2px #999999;
      border-radius: 3px;
      padding: 20px;
    }
  }
  .dropzone {
    padding: 0;
    .dz-preview {
      margin: 0;
    }
    .dz-error-message {
      display: none;
    }
  }

  .dropzone .dz-preview.dz-error .dz-error-message {
    display: none;
  }
</style>
