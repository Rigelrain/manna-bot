//const config = require('../config/config')
// const Discord = require('discord.js')
const helper = require('../js/helpers')
const db = require('../js/db')

/**
 * Request for a donation
 */

const options = {

    name: 'pledge',
    aliases: ['donate', 'giveto'],

    description: 'Offer to donate. Give amount as a number or `all` if you will donate the max remaining amount',
    minArgs: 1,
    usage: '<user> [amount]',
    
    example: '@Manna 3',

    roleRestrict: 'pledger',

    cooldown: 2,
}

async function execute(message, args) {

    //// Who to give to?
    if(!message.mentions.users.size) {
        return helper.replyCustomError(message, 'You must name a user', `Mention the user in your pledge message, see usage: ${message.prefix}${options.name} ${options.usage}`)
    }
    const requester = message.mentions.users.first()
    if(!requester) {
        // TODO this might be redundant
        return helper.replyCustomError(message, 'You must name a valid user', `Mention the user in your pledge message, see usage: ${message.prefix}${options.name} ${options.usage}`)
    }
    console.log(`[ DEBUG ] ${message.author} wants to donate to ${requester} (id ${requester.id})`)
    //// END User

    //// Get the request from DB
    const req = await db.getRequestData(requester.id)
    //// END DB

    //// How much to give?
    let amount, amountFound = false

    try {
        const remainingAmount = req.remaining // hardcode for now
    
        for(let i = 0; i < args.length; i++) {
            const arg = args[i]
            if(isNaN(parseInt(arg))) {
                if(arg == 'full') {
                    amountFound = true
                    amount = remainingAmount
                    break
                }
            }
            else {
                amount = parseInt(arg)
                if(amount > remainingAmount) amount = remainingAmount
                amountFound = true
                break
            }   
        }
    
        if(!amountFound) {
            return helper.replyCustomError(message, 'Invalid amount', `Please give the amount as a number or 'full', see usage: ${message.prefix}${options.name} ${options.usage}`)
        }
    
        console.log(`[ DEBUG ] Wants to donate amount of ${amount}`)
    }
    catch(e) {
        throw `Could not get the right amount: ${e.message}`
    }
    //// END amount

    //// Updating the document in DB
    const update = await db.updateRequest(req._id, req.remaining - amount)
    //// END DB

    //// Updating the original message to include the pledger and progress
    try {
        const reqMsg = await message.channel.messages.fetch(update.messageID)
        const reqEmbed = reqMsg.embeds[0]

        //console.log(reqEmbed)

        if(reqEmbed.fields.length > 0) {
            // there's a previous 'Still looking...' field
            // so remove it
            reqEmbed.fields.pop()
        }

        reqEmbed.fields.push({
            name: `Donation of ${amount} ${update.type}`,
            value: `from ${message.author}!`,
            inline: false,
        })
        reqEmbed.fields.push({
            name: update.remaining == 0? 'Request fulfilled!' : `Still looking for ${update.remaining} ${update.type}`,
            value: 'Progress:',
            inline: false,
        })
        if(!reqEmbed.footer) reqEmbed.footer = {} // for first donation
        reqEmbed.footer.text = helper.getProgress(update.amount - update.remaining, update.amount)

        //console.log(reqEmbed)

        await reqMsg.edit(reqEmbed)

        //// END request msg update

        //// Handle request fullfilment
        if(update.remaining == 0) {
            console.log('[ DEBUG ] Request fulfilled!')
            await db.deleteRequest(req._id)
            // TODO DM the requester that the request is filled, link to msg?
            requester.send(`Your request was fulfilled! Check ${message.channel}`)
            requester.send(reqEmbed)
        }
        //// END fullfil
    }
    catch(e) {
        console.log(`[ ERROR ] ${e}`)
    }

    return helper.replySuccess(message, 'Donation succeeded!', `You've offered to give ${requester} ${amount} ${req.type}`)
}

module.exports = options
module.exports.execute = execute