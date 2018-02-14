require('dotenv').config()
const restify = require('restify')
const builder = require('botbuilder')

// Setup Restify Server
const server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url)
})

// Create chat bot
const connector = new builder.ChatConnector({
  appId: process.env.APP_ID,
  appPassword: process.env.APP_PASS
})

const bot = new builder.UniversalBot(connector)
server.post('/api/messages', connector.listen())

const model = process.env.LUIS_ENDPOINT
bot.recognizer(new builder.LuisRecognizer(model))

bot.dialog('/', [
  (session, args, next) => {
    session.send('Hello there!')
    session.endDialog('I can help you get an Azure Code, find resources, or connect you with our Microsoft team! What would you like help with?')
  }
])

bot.library(require('./app/dialogs/greeting').createLibrary())
bot.library(require('./app/dialogs/teamInfo').createLibrary())
bot.library(require('./app/dialogs/techHelp').createLibrary())
bot.library(require('./app/dialogs/azureCode').createLibrary())
bot.library(require('./app/dialogs/negativeComment').createLibrary())
bot.library(require('./app/dialogs/profanity').createLibrary())
bot.library(require('./app/dialogs/azureCodeError').createLibrary())
bot.library(require('./app/dialogs/endConvo').createLibrary())
bot.library(require('./app/dialogs/botHelp').createLibrary())
bot.library(require('./app/dialogs/boothLocation').createLibrary())
bot.library(require('./app/dialogs/none').createLibrary())

// TODO add server proxy for ifame
server.get(/\/?.*/, restify.plugins.serveStatic({
  directory: __dirname,
  default: 'index.html'
}))
