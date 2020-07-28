const reply = require('../../js/reply')
const Giveaway = require('../../schemas/giveaway')
const end = require('./end').execute

/**
 * End expired giveaways and purge old giveaways from DB
 */

const options = {
    type: 'giveaways',

    name: 'cleangiveaways',
    aliases: [],

    description: 'End giveaways that should have ended already, remove old giveaways completely.',
    minArgs: 0,

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message) { 
    const giveaways = await Giveaway.find({ serverID: message.guild.id, ended: false, expires: {$lte: Date.now()}}, '_id expires messageID channelID').lean().exec()

    if(!giveaways || giveaways.length === 0) {
        return reply.success(message, 'No giveaways to clean up!')
    }

    const endables = []

    giveaways.forEach(gaw => {
        endables.push(end(message, [gaw.messageID, gaw.channelID], true))
    })

    await Promise.all(endables)

    // TODO delete very old giveaways from DB

    reply.success(message, 'Old giveaways have been ended!')
}

module.exports = options
module.exports.execute = execute