const reply = require('../../js/reply')
const Queue = require('../../schemas/queue')

const options = {
    type: 'queues',

    name: 'close',
    aliases: ['delete', 'qend', 'qclose'],

    usage: '[queue name]',
    description: 'Ends queue with name <queue name> (if found).',

    cooldown: 5,

    roleRestrict: 'queuemod',
}

async function execute(message, args) {
    if(!(message.queueCategory && message.queueChannel)) {
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    //const queueListChannelID = message.queueChannel
    const queueListChannel = message.guild.channels.cache.get(message.queueChannel)

    let queueName = args.join('-').toLowerCase()
    if(!queueName || queueName.length === 0) {
        // maybe command was given in a queue channel
        queueName = message.channel.name
    }

    const queue = await Queue.findOneAndDelete({serverID: message.guild.id, name: queueName, host: message.author.id})

    // if name not found, abort
    if (!queue) {
        return reply.customError(message, 'Oops! Couldn\'t do that!', `Either \`${queueName}\` doesn't exist or it isn't your queue... Maybe check the spelling?`, `> No queue ${queueName} found. Aborting.`)
    }

    console.log(`[ INFO ]  > Queue "${queueName}" deleted.`)

    // delete channel
    const queueChannel = await message.guild.channels.cache.get(queue.channelID)
    await queueChannel.delete()

    // edit the queue creation message
    const queueMsg = await queueListChannel.messages.fetch(queue.messageID)
    const queueMsgEmbed = queueMsg.embeds[0]

    queueMsgEmbed.title = `👥 Queue \`${queue.name}\` has ended. 👥`
    queueMsgEmbed.description = 'Queue channel has been voided...'
    delete queueMsgEmbed.footer

    await queueMsg.react('🚫')
    queueMsg.edit(queueMsgEmbed)

    if(message.channel == queueListChannel) {
        // if command was given in the list channel, remove the clutter
        message.delete()
        // if command was given in the queue channel, the whole channel was deleted
    }

    return
}

module.exports = options
module.exports.execute = execute
