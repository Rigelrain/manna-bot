const info = require('../config/botinfo')
const config = require('../config/config')
const Discord = require('discord.js')
const db = require('../js/db')
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
    // check that the user doesn't already have a pending request
    if(await db.getRequestData(message.author.id)) {
        return helper.replyCustomError(message, 'You already have a request pending', 'Please cancel your previous request before starting a new one')
    }

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

    const reqEmbed = new Discord.MessageEmbed()
        .setColor(config.colors.success)
        .setTitle(`Request for ${amount? amount : ''} ${reqtype}`)
        .setDescription(`For who? --> ${message.author}${description? '\n**Details**:' + description : ''}`)
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
        console.log(`[ ERROR ] Error in saving request to DB:
        ${e}`)
    }
}

module.exports = options
module.exports.execute = execute