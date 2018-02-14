const builder = require('botbuilder')
const boothLocation = require('../../data/hackSpecificData').boothLocation

const lib = new builder.Library('boothLocation')
lib.dialog('/', [
  function (session, args, next) {
    session.endDialog(`Our booth is ${boothLocation}, come visit us!`)
  }
]).triggerAction({
  matches: 'boothLocation'
})

module.exports.createLibrary = function () {
  return lib.clone()
}
