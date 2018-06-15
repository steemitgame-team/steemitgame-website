'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"remote-dev"',
  API_SERVER_URL: '"https://api-dev.steemgg.com/"'
})