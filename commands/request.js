const info = require('../config/botinfo')
const config = require('../config/config')
const Discord = require('discord.js')
const Request = require('../schemas/request')
const helper = require('../js/helpers')

/**
 * Request for a donation
 */

const options = {

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
    const reqtype = args.pop().toLowerCase()

    if(message.requesttypes.length > 0 && !message.requesttypes.includes(reqtype)) {
        return helper.replyCustomError(message, 'Invalid request type', 'You can check the valid requests types with command `check`')
    }

    let amount, description

    if(isNaN(parseInt(args[0]))) {
        // whole rest of args is description
        amount = 1
        console.log(`[ DEBUG ] current args: ${args}`)
        description = args.join(' ')
    }
    else {
        console.log(`[ DEBUG ] current args: ${args}, typeof args = array? ${Array.isArray(args)}, args length = ${args.length}`)

        amount = parseInt(args.shift())

        if(args.length == 1) {
            console.log(`[ DEBUG ] only arg: ${args[0]}`)
            description = args[0]
        }
        else if(args.length > 1) {
            console.log(`[ DEBUG ] current args: ${args}`)
            description = args.join(' ')
        }
    }

    console.log(`[ DEBUG ] new request: 
    For ${message.author.id}
    Type: ${reqtype}
    Amount: ${amount}
    Details: ${description}`)

    const reqEmbed = new Discord.MessageEmbed()
        .setColor(config.colors.success)
        .setTitle(`Request for ${amount? amount : ''} ${reqtype}`)
        .setDescription(`For who? --> ${message.author}`)
    
    if(description) {
        reqEmbed.addField('Details', description)
    }

    const reply = await message.channel.send(reqEmbed)
    console.log(`[ DEBUG ] reply message id: ${reply.id}`)

    const reqDocument = {
        serverID: message.guild.id,
        userID: message.author.id,
        messageID: reply.id,
        request: {
            type: reqtype,
            amount: amount,
        },
    }

    console.log(reqDocument)

    try {
        await Request.create(reqDocument)
    }
    catch(e) {
        console.log(`[ ERROR ] Error in saving request to DB:
        ${e}`)
    }
}

module.exports = options
module.exports.execute = execute