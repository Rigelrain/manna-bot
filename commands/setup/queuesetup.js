const info = require('../../config/botinfo')
const helper = require('../../js/helpers')
const Server = require('../../schemas/server')

/**
 * Set queue info to the server
 */

const options = {

    name: 'queuesetup',
    aliases: ['queueset', 'qset'],

    description: 'Add the queue category and main channel to bot settings. Needed before queues can be used!',
    minArgs: 2,
    usage: '<category id> <channel>',

    help: info.queues,
    
    example: '123456789123456789 #examplechannel',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 

    const update = {}

    // get the queue channel from mentions
    if(!message.mentions.channels.size) {
        return helper.replyCustomError(message, 'No channel?', `You need to mention a channel in your setup message. Usage: ${message.prefix}${options.usage}`)
    }
    update.queueChannel = message.mentions.channels.first().id

    // get the category id from args
    for(let i = 0; i < args.length; i++) {
        const cat = message.guild.channels.cache.get(args[i])
        if(cat && cat.type == 'category') {
            update.queueCategory = cat.id
            break
        }
    }
    if(!update.queueCategory) {
        return helper.replyCustomError(message, 'No category?', `You need to give a category ID in your setup message. Usage: ${message.prefix}${options.usage}`)
    }

    console.log(`[ DEBUG ] Trying to update server with info: ${JSON.stringify(update, null, 2)}`)

    const updated = await Server.findByIdAndUpdate(message._id, update, {upsert: true, new: true}).lean().exec()

    console.log(`[ DEBUG ] Updated server info to ${JSON.stringify(updated, null, 2)}`)

    return helper.replySuccess(message, 'Queue info is set!', 'You can now start using queues.', true)
}

module.exports = options
module.exports.execute = execute