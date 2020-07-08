const helper = require('../../js/helpers')
const Server = require('../../schemas/server')

/**
 * Set queue msg to the server
 */

const options = {
    type: 'queues',

    name: 'queuemessage',
    aliases: ['queuemsg', 'setqueuemsg'],

    description: 'Add a custom message to be used in queue channel welcome messages',
    minArgs: 1,
    usage: '[message]',
    
    example: 'Welcome to the queue!',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 

    const msg = args.join(' ')

    console.log(`[ DEBUG ] Trying to update server queueMsg to: ${msg}`)

    // cannot use findById here, since server info might not exist yet
    const updated = await Server.findOneAndUpdate({serverID: message.guild.id}, {queueMsg: msg}, {upsert: true, new: true}).lean().exec()

    console.log(`[ DEBUG ] Updated server info to ${JSON.stringify(updated, null, 2)}`)

    return helper.replySuccess(message, 'Queue message is set!', null, true)
}

module.exports = options
module.exports.execute = execute