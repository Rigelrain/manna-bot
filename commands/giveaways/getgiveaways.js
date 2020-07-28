const reply = require('../../js/reply')
const Giveaway = require('../../schemas/giveaway')

/**
 * Get server's all active giveaways
 */

const options = {
    type: 'giveaways',

    name: 'getgiveaways',
    aliases: ['activegiveaways'],

    description: 'List all active giveaways',
    minArgs: 0,

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message) { 
    const giveaways = await Giveaway.find({ serverID: message.guild.id, ended: false}, 'hostID prize amountOfWinners').lean().exec()

    if(!giveaways || giveaways.length === 0) {
        return reply.success(message, 'Currently no giveaways active', null, true)
    }

    let giveawaylist = ''

    giveaways.forEach(gaw => {
        giveawaylist += `\nFrom <@${gaw.hostID}>: ${gaw.amountOfWinners} ${gaw.prize}`
    })

    if(giveawaylist.length > 2000) {
        // too long, needs pagination
        // for now send as plain
        message.delete()
        return message.channel.send('Giveaways currently in progress:' + giveawaylist)
    }

    return reply.success(message, 'Giveaways currently in progress', giveawaylist, true)
}

module.exports = options
module.exports.execute = execute