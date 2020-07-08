const helper = require('../../js/helpers')
const db = require('../../js/db')

/**
 * Set requester role    
 * Calls the setrole internally
 */

const options = {
    type: 'donations',

    name: 'cancel',
    aliases: ['cancelreq', 'cancelrequest', 'endrequest'],

    description: 'Cancel the previous donation request.',
    minArgs: 0,

    roleRestrict: 'requester',

    cooldown: 2,
}

async function execute(message) { 
    // Get the request from DB
    const req = await db.getRequestData(message.author.id)
    if(!req) {
        return helper.replyCustomError(message, 'Sorry! I can\'t find any old requests from you')
    }

    // fetch req msg and send it as DM
    const reqMsg = await message.channel.messages.fetch(req.messageID)
    const reqEmbed = reqMsg.embeds[0]

    if(reqEmbed.fields.length > 0) {
        // there's a 'Still looking...' field
        // so remove it
        reqEmbed.fields.pop()
    }

    reqEmbed.fields.push({
        name: 'Request cancelled!',
        value: req.remaining != req.amount ? 'Thank you for the donations!' : 'Let\'s try this again some time...',
        inline: false,
    })
    if(reqEmbed.footer) reqEmbed.footer.text = 'Manna signing out'

    //console.log(reqEmbed)

    await reqMsg.edit(reqEmbed)
    
    // delete req from db
    await db.deleteRequest(req._id)

    // DM the requester
    message.author.send(`Your request was cancelled! Check ${message.channel}`)
    message.author.send(reqEmbed).catch((e) => {
        console.log(`[ ERROR ] Could not send cancel DM to ${message.author.tag} ${e.message}`)
        message.reply('Your request was cancelled! But it seems like I can\'t DM you the details. Do you have DMs disabled?')
    })

    return helper.replySuccess(message, 'Old request cancelled!')
}

module.exports = options
module.exports.execute = execute