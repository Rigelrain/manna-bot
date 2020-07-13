const info = require('../../config/botinfo')
const Discord = require('discord.js')
const db = require('../../js/db')
const {getRandomColor} = require('../../js/helpers')
const reply = require('../../js/reply')

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

    help: info.requests + 
    'Type is loosely the unit of the request. If you request 3 hugs, the type is \'hugs\'. If you request passionate kiss, the type is \'kiss\'. By default you can use any type, but the server might choose to limit these to specific types of donations allowed on the server. The type has to be the last word in your command.\nThe amount is simple, it\'s simply the quantity of the requested item/service. If left blank, by default you are requesting one (1) item/service.\nYou can also give a description (quality). This is a free form text describing any details of your request.',

    roleRestrict: 'requester',

    cooldown: 2,
}

async function execute(message, args) {
    // check that the user doesn't already have a pending request
    if(await db.getRequestData(message.author.id)) {
        return reply.customError(message, 'You\'re asking for too much', 'Please cancel your previous request before starting a new one')
    }

    const reqtype = args.pop().toLowerCase()

    if(message.requestTypes.length > 0 && !message.requestTypes.includes(reqtype)) {
        return reply.customError(message, 'Sorry but you can\'t ask for that!', `You can check the valid requests with command \`${message.prefix}check\``)
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
        .setColor(getRandomColor())
        .setTitle(`🎁 Request for ${amount? amount : ''} ${reqtype} 🎁`)
        .setDescription(`For who? --> ${message.author}${description? '\n**Details**: ' + description : ''}`)
        .setFooter('')
    
    // NOTE! The fresh request should not have any fields, since
    // pledge will check the amount fields to know if it should
    // add a progress title (as a field)

    const msgreply = await message.channel.send(reqEmbed)
    message.delete({timeout: 1000})

    const reqDocument = {
        serverID: message.guild.id,
        userID: message.author.id,
        messageID: msgreply.id,
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
        reply.customError(message, 'Oopsie with the request!', `${message.author}, I encountered an issue saving your request to the database, sorry!`, `Error in saving request to DB: ${e}`, true)
    }
}

module.exports = options
module.exports.execute = execute