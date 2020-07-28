const reply = require('../../js/reply')
const helper = require('../../js/helpers')
const config = require('../../config/config')
const end = require('../../js/giveawayend')
const Giveaway = require('../../schemas/giveaway')

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
    const giveawayMsg = await message.channel.messages.fetch(args[0])

    if(!giveawayMsg) {
        return reply.customError(message, 'Oops! Couldn\'t get that giveaway...', 'Get the giveaway ID by right-clicking the giveaway message and selecting Copy ID.')
    }

    const giveawayMsgEmbed = giveawayMsg.embeds[0]

    if(giveawayMsgEmbed.description.includes(message.author.id) 
        || helper.checkRole(message.member, 'moderator', message.roles)) {

        console.log(`[ INFO ] Giveaway ${args[0]} ended manually.`)

        // === Fetch giveaway from DB
        const giveaway = await Giveaway.findOne({serverID: message.guild.id, messageID: giveawayMsg.id}, '_id amountOfWinners ended').lean().exec()

        if(giveaway.ended) {
            return reply.customError(message, 'Giveaway has already ended')
        }

        // === Who joined?
        let joined
        const reaction = giveawayMsg.reactions.cache.get(config.emojis.giveaway)
        if(reaction && reaction.users) {
            joined = await reaction.users.fetch()
            joined = joined.filter(user => !user.bot)
        }

        // === end the giveaway
        end(giveaway._id, joined, giveaway.amountOfWinners, giveawayMsg, message.channel)

        message.delete({timeout: 5000})
    }
    else {
        return reply.customError(message, 'Hmm... Doesn\'t look like your own giveaway...', 'You can only cancel giveaways that are your own, unless you\'re a moderator.')
    }
}

module.exports = options
module.exports.execute = execute