const Queue = require('../../schemas/queue')
const reply = require('../../js/reply')

const options = {
    type: 'queues',

    name: 'edit',
    aliases: ['qadd', 'qedit', 'expand'],

    minArgs: 1,
    usage: '<amount>',
    description: 'Adds or substracts capacity of an existing queue. Use only in an existing queue.',

    cooldown: 5,

    roleRestrict: 'queuemod',
}

async function execute(message, args) {
    if(!(message.queueCategory && message.queueChannel)) {
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    const expandBy = parseInt(args.shift())

    console.log(`[ INFO ] Editing queue ${message.channel} capacity by ${expandBy}`)

    let queue
    try {
        queue = await Queue.findOneAndUpdate({serverID: message.guild.id, channelID: message.channel.id}, {$inc: { capacity: expandBy }}, {lean:true, new: true}).exec()
    }
    catch(e) {
        return reply.customError(message, 'Oops! Something went wrong...', null, `> Error from updating DB: ${e}`)
    }

    // if not in queue channel
    if (!queue) {
        return reply.customError(message, 'Oops! You need to be in a queue channel to add capacity.', null, '> Not in correct channel. Aborting.')
    }

    // edit the queue created msg
    const queueListChannel = message.guild.channels.cache.get(message.queueChannel)
    const queueMsg = await queueListChannel.messages.fetch(queue.messageID)
    const queueMsgEmbed = queueMsg.embeds[0]

    queueMsgEmbed.fields[0].value = `${queue.taken} / ${queue.capacity}` 

    await queueMsg.edit(queueMsgEmbed)

    // confirmation message
    return reply.success(message, `Available spots ${expandBy < 0? 'decreased': 'increased'} by ${expandBy}.`, `${queue.capacity - queue.taken} of ${queue.capacity} spots left.`, true)
}

module.exports = options
module.exports.execute = execute
