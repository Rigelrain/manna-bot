const reply = require('../../js/reply')
const helper = require('../../js/helpers')
const config = require('../../config/config')

/**
 * End a giveaway prematurely
 */

const options = {
    type: 'giveaways',

    name: 'end',
    aliases: ['gend', 'cancelgiveaway'],

    description: 'End a giveaway. You can get the ID of the giveaway by right-clicking the giveaway message.',
    minArgs: 1,
    usage: '<giveaway message ID>',
    
    example: '123456789123456789',

    roleRestrict: 'giveaway',

    cooldown: 2,
}

async function execute(message, args) { 

    const giveawayMsg = message.channel.messages.cache.get(args[0])

    if(!giveawayMsg) {
        return reply.customError(message, 'Oops! Couldn\'t get that giveaway...', 'Get the giveaway ID by right-clicking the giveaway message and selecting Copy ID.')
    }

    const giveawayMsgEmbed = giveawayMsg.embeds[0]

    if(giveawayMsgEmbed.description.includes(message.author.id) 
        || helper.checkRole(message.member, 'moderator', message.roles)) {
        console.log(`[ INFO ] Giveaway ${args[0]} ended manually.`)
        giveawayMsg.react(config.emojis.end) // --> the reaction collector will handle the rest
        message.delete({timeout: 5000})
    }
    else {
        return reply.customError(message, 'Hmm... Doesn\'t look like your own giveaway...', 'You can only cancel giveaways that are your own, unless you\'re a moderator.')
    }
}

module.exports = options
module.exports.execute = execute