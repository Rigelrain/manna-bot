const reply = require('../../js/reply')
const Queue = require('../../schemas/queue')

/**
 * This command is for members in the queue to leave the queue,
 * signalling that they have done what they queue'd for
 */

const options = {
    type: 'queues',

    name: 'leave',

    aliases: ['qexit', 'qleave'],

    usage: '[queue name]',
    description: 'Removes you from the queue.',

    roleRestrict: 'queue',
    cooldown: 3,
}

async function execute(message, args) {
    if(!(message.queueCategory && message.queueChannel)) {
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    let queueName = args.join('-').toLowerCase()
    if(!queueName || queueName.length === 0) {
        // maybe command was given in a queue channel
        queueName = message.channel.name
    }

    // look for queue in db
    const queue = await Queue.findOne({ serverID: message.guild.id, name: queueName }).lean().exec()

    // if queue not found, abort
    if (!queue) {
        return reply.customError(message, 'Oops! Could not find queue.', 'You should either write this in the queue channel or check the spelling.', `> No queue ${queueName} found. Aborting.`)
    }

    // host cannot leave
    if(queue.host == message.author.id) {
        return reply.customError(message, 'Are you trying to leave your own queue?', `I'm sorry I can't allow that... Others would be left hanging, you see? Did you perhaps mean  to use \`${message.prefix}close\` instead?`)
    }

    // make channel invisible to user
    await message.guild.channels.cache.get(queue.channelID).createOverwrite(message.author, { 'VIEW_CHANNEL': false, 'SEND_MESSAGES': false })

    // check if user is in the queue
    if (queue.users.includes(message.author.id)) {

        await Queue.findByIdAndUpdate(queue._id, { 
            $inc: { 
                taken: -1,
            }, 
            $pullAll: { 
                users: [ message.author.id ],
            },
        }).exec()
        // edit the queue created msg
        const queueListChannel = message.guild.channels.cache.get(message.queueChannel)
        const queueMsg = await queueListChannel.messages.fetch(queue.messageID)
        const queueMsgEmbed = queueMsg.embeds[0]

        queueMsgEmbed.fields[0].value = `${queue.taken - 1} / ${queue.capacity}`    

        await queueMsg.edit(queueMsgEmbed)

        // note the leaving in the queue channel
        return reply.sendToChannel(message, queue.channelID, `${message.author.username} left queue`, `Queue filled: \`${queue.taken - 1}/${queue.capacity}\``)
    }
    else {
        // assume that the user has been in line, but is now done
        
        return reply.success(message, `${message.author.username} left the queue ${queueName}`)
    }
}

module.exports = options
module.exports.execute = execute