const info = require('../../config/botinfo')
const reply = require('../../js/reply')
const Server = require('../../schemas/server')
const {checkIsAdd} = require('../../js/helpers')

/**
 * Set queue info to the server
 */

const options = {
    type: 'giveaways',

    name: 'setgiveaway',
    aliases: ['giveawaysetup', 'gset', 'setgiveawayinfo'],

    description: 'Add/remove channel(s) to the list of channels were giveaways are allowed.',
    minArgs: 2,
    usage: '<add/remove> <channel1> [channel2] [channel3...]',

    help: info.giveaways,
    
    example: 'add #examplechannel',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    // === Check whether should add or remove
    const rawAddRemove = args.shift().toLowerCase()
    let isAdd
    try {
        isAdd = checkIsAdd(rawAddRemove)
    }
    catch(e) {
        return reply.customError(message, e, `Bot usage: ${message.prefix}${options.usage}`)
    }
    console.log(`[ DEBUG ] ${isAdd? 'Adding' : 'Removing'} giveaway channels...`)

    // get the queue channel from mentions
    if(!message.mentions.channels.size) {
        return reply.customError(message, 'No channel?', `You need to mention a channel in your setup message. Usage: ${message.prefix}${options.usage}`)
    }
    const update = message.mentions.channels.map(channel => channel.id)

    console.log(`[ DEBUG ] Trying to update server with giveaway channels: ${JSON.stringify(update, null, 2)}`)

    // cannot use findById here, since server info might not exist yet
    let updated
    if(isAdd) {
        // use addToSet to ensure no role is added twice
        updated = await Server.findOneAndUpdate({serverID: message.guild.id}, { $addToSet: { giveawayChannels: {$each: update}} }, { upsert: true, new: true } ).lean().exec()
    }
    else {
        // use pull to remove all mentioned roles
        updated = await Server.findOneAndUpdate({serverID: message.guild.id}, { $pullAll: { giveawayChannels: update} }, { upsert: true, new: true} ).lean().exec()
    }

    console.log(`[ DEBUG ] Updated server info to ${JSON.stringify(updated, null, 2)}`)

    return reply.success(message, `${isAdd? 'Added' : 'Removed'} giveaway channels!`, null, true)
}

module.exports = options
module.exports.execute = execute