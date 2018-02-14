const builder = require('botbuilder')
const tech = require('../../data/techResources')
const hackData = require('../../data/hackSpecificData')

const lib = new builder.Library('techHelp')
lib.dialog('/', [
  function (session, args, next) {
    // Get array of all current tech names
    var techNames = []
    tech.forEach(t => {
      techNames.push(t.name)
    })

    // See if they passed in any entities
    if (args.intent.entities.length > 0) {
      const techType = args.intent.entities[0].type

      // See if the entity found matches any of our tech's we can handle
      techNames.forEach((t, i) => {
        if (`tech::${t}` === techType) {
          session.dialogData.choice = i
          next()
        }
      })
    } else {
      session.send('A great first step to getting help is to head to https://docs.microsoft.com, but if you need something more specific I\'d be more than happy to help!')
      builder.Prompts.choice(session, 'Which technology do you need help with? (Choose a number)', techNames)
    }
  },
  function (session, results) {
    if (results.resumed) {
      results.response = {}
      results.response.index = session.dialogData.choice
    }

    // Send the correct prompt based on the option selected
    tech.forEach((t, i) => {
      if (i === results.response.index) {
        session.endDialog(t.prompt)
      }
    })

    // If we didn't end the dialog, something went wrong
    session.endDialog(`If I can't help you with any of your needs you can head to our booth ${hackData.boothLocation} and talk with someone or email the team at ${hackData.teamEmail}`)
  }
]).triggerAction({
  matches: 'techHelp'
})

module.exports.createLibrary = function () {
  return lib.clone()
}
