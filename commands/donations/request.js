const info = require('../../config/botinfo')
const Discord = require('discord.js')
const db = require('../../js/db')
const helper = require('../../js/helpers')

/**
 * Request for a donation
 */

const options = {
    type: 'donations',

    name: 'request',
    aliases: ['req', 'askfor'],

    description: 'Request for a donation.',
    minArgs: 1,
    usage: '[amount] [description] <request type>',
    
    example: '3 warm hugs',

    help: info.requests,

    roleRestrict: 'requester',

    cooldown: 2,
}

async function execute(message, args) {
    // check that the user doesn't already have a pending request
    if(await db.getRequestData(message.author.id)) {
        return helper.replyCustomError(message, 'You\'re asking for too much', 'Please cancel your previous request before starting a new one')
    }

    const reqtype = args.pop().toLowerCase()

    if(message.requestTypes.length > 0 && !message.requestTypes.includes(reqtype)) {
        return helper.replyCustomError(message, 'Sorry but you can\'t ask for that!', `You can check the valid requests with command \`${message.prefix}check\``)
    }

    let amount, description

    if(isNaN(parseInt(args[0]))) {
        // whole rest of args is description
        amount = 1
        description = args.join(' ')
    }
    else {
        amount = parseInt(args.shift())

        if(args.length == 1) {
            description = args[0]
        }
        else if(args.length > 1) {
            description = args.join(' ')
        }
    }

    const reqEmbed = new Discord.MessageEmbed()
        .setColor(helper.getRandomColor())
        .setTitle(`🎁 Request for ${amount? amount : ''} ${reqtype} 🎁`)
        .setDescription(`For who? --> ${message.author}${description? '\n**Details**: ' + description : ''}`)
        .setFooter('')
    
    // NOTE! The fresh request should not have any fields, since
    // pledge will check the amount fields to know if it should
    // add a progress title (as a field)

    const reply = await message.channel.send(reqEmbed)
    message.delete({timeout: 1000})

    const reqDocument = {
        serverID: message.guild.id,
        userID: message.author.id,
        messageID: reply.id,
        type: reqtype,
        amount: amount,
        remaining: amount,
    }

    try {
        const newRequest = await db.newRequest(reqDocument)
        console.log(`[ DEBUG ] new request: 
        For ${newRequest.userID}
        Type: ${newRequest.type}
        Amount: ${newRequest.amount}
        Details: ${description}`)
    }
    catch(e) {
        helper.replyCustomError(message, 'Oopsie with the request!', `${message.author}, I encountered an issue saving your request to the database, sorry!`, `Error in saving request to DB: ${e}`, true)
    }
}

module.exports = options
module.exports.execute = execute