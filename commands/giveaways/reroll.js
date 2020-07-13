const reply = require('../../js/reply')
const helper = require('../../js/helpers')
const Giveaway = require('../../schemas/giveaway')

/**
 * End a giveaway prematurely
 */

const options = {
    type: 'giveaways',

    name: 'reroll',
    aliases: [],

    description: 'Reroll one winner for a giveaway. You can get the ID of the giveaway by right-clicking the giveaway message.',
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

    if(!giveawayMsgEmbed.description.includes(message.author.id) && !helper.checkRole(message.member, 'moderator', message.roles)) {
        return reply.customError(message, 'Hmm... Doesn\'t look like your own giveaway...', 'You can only reroll giveaways that are your own, unless you\'re a moderator.')
    }

    console.log(`[ INFO ] Giveaway ${args[0]} being rerolled.`)
        
    // get the giveaway object from DB
    const giveaway = await Giveaway.findOne({serverID: message.guild.id, messageID: giveawayMsg.id}).lean().exec()

    // get new winner
    if(!giveaway || !giveaway.users || giveaway.users.length == 0) {
        return reply.customError(message, 'Can\'t reroll!', 'There\'s no one left...')
    }
    const newWinnerIndex = Math.floor(Math.random() * giveaway.users.length)
    const newWinner = giveaway.users[newWinnerIndex]
    //console.log(newWinner)

    // remove new winner from the joined, add to winners
    const updatedUsers = giveaway.users.filter(id => id != newWinner)
    
    // update the DB
    Giveaway.findByIdAndUpdate(giveaway._id, {users: updatedUsers}).lean().exec()

    // edit the giveaway message fields[0]
    giveawayMsgEmbed.fields[0].value += `\nNew winner: <@${newWinner}>`
    giveawayMsg.edit(giveawayMsgEmbed)

    // send a new ping message
    // has to be sent as plain text for the pings to work
    message.channel.send(`A new winner for **${giveaway.prize}** was rolled! ... And the lucky one is: <@${newWinner}>! Congrats! (Please contact <@${giveaway.hostID}> for your prize)`) 

    message.delete({timeout: 5000})
}

module.exports = options
module.exports.execute = execute