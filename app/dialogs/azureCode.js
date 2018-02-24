const builder = require('botbuilder')
const validator = require('validator')
const table = require('../utilities/tableStorage')
const hackData = require('../../data/hackSpecificData')

const lib = new builder.Library('azureCode')
lib.dialog('/', [
  function (session, args, next) {
    builder.Prompts.text(session, 'Ok let\'s get you set up! What\'s your name?')
  },
  function (session, results, next) {
    session.userData.name = results.response
    session.beginDialog('/school')
  },
  function (session, results, next) {
    session.userData.school = results.response
    session.beginDialog('/email')
  },
  function (session, results, next) {
    session.userData.email = results.response
    session.beginDialog('/pass')
  },
  function (session, results, next) {
    session.endDialog()
  }
]).triggerAction({
  matches: 'azureCode',
  onInterrupted: function (session, id) {
    console.log('THIS DIALOG WAS INTERRUPED BY A STRONGER INTENT SOMEWHERE ELSE')

    // We are in the middle of a form, so unless someone needs help just continue
    if (id !== 'botHelp:/') {
      // TODO: investigate if we can pass what was previously said and avoid printing the default "I didn't understand" msg
      session.routeToActiveDialog()
    } else {
      session.clearDialogStack()
      session.beginDialog('botHelp:/')
    }
  }
})

lib.dialog('/school', [
  function (session) {
    builder.Prompts.text(session, 'What university do you go to?')
  },
  function (session, results) {
    session.endDialogWithResult(results)
  }
])

lib.dialog('/email', [
  function (session) {
    builder.Prompts.text(session, 'What\'s your email address?')
  },
  function (session, results) {
    if (validator.isEmail(results.response)) {
      session.endDialogWithResult(results)
    } else {
      session.send('Invalid email. Please try again.')
      session.beginDialog('/email')
    }
  }
])

// lib.dialog('/phone', [
//   function (session) {
//     builder.Prompts.text(session, 'What is your phone number?')
//   },
//   function (session, results) {
//     if (validator.isMobilePhone(results.response.replace(/[^0-9]/g, ''), 'en-US')) {
//       session.endDialogWithResult(results)
//     } else {
//       session.send('Invalid phone number. Please try again.')
//       session.beginDialog('/phone')
//     }
//   }
// ])

// lib.dialog('/project', [
//   function (session) {
//     builder.Prompts.text(session, "We're almost done! Tell me a little bit about your project!")
//   },
//   function (session, results) {
//     session.endDialogWithResult(results)
//   }
// ])

lib.dialog('/pass', [
  function (session, args, next) {
    // checks student table to test if email is unique
    // args(callIfUnique, callIfNotUnique, next)
    table.getPassOnlyOnUniqueEmail(session, function ifUnique () {
      table.retrievePass(session, function (session) {
        session.endDialog(`Great! Here is your Azure pass: ${session.userData.code}.
          To activate: Go to http://www.microsoftazurepass.com/ and paste in this number, and don't forget to fill out our survey ${hackData.surveyLink} for a chance to win ${hackData.prize}. 
          Good luck!`)
      }, next)
    }, function ifNotUnique (next) {
      session.send('Sorry, it seems you have already signed up for an Azure Code. We can only allow one per student. Happy Hacking :)')
      next()
    }, next)
  },
  function (session, args, next) {
    session.send('Can I help you with anything else?')
    session.endDialog()
  }
])

module.exports.createLibrary = function () {
  return lib.clone()
}
