const helper = require('../../js/helpers')
const Queue = require('../../schemas/queue')
const User = require('../../schemas/user')

const options = {

    name: 'join',
    aliases: ['qjoin', 'qenter', 'enter'],

    minArgs: 1,
    usage: '<queue name>',
    description: 'Adds you to the specified queue and sends a message with your info in the queue channel.',

    cooldown: 5,

    roleRestrict: 'queue',
}

async function execute(message, args) {
    if(!(message.queueCategory && message.queueChannel)) {
        return helper.replyCustomError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    // === LOOK FOR SER
    const user = await User.findOne({ userID: message.author.id }).exec()

    // if userdata not found, abort
    if (!user) {
        return helper.replyCustomError(message, 'Oops! You haven\'t added your info yet.', `Use \`${message.prefix}set\` to set that up`, '> User hasn\'t added info. Aborting.')
    }
    if (!(user.ign && user.island)) {
        return helper.replyCustomError(message, 'Oops! You haven\'t added all of your info yet.', `Make sure you \`${message.prefix}set\` your IGN and island name.`, `> User ${message.author} hasn't added info. Aborting.`)
    }
    // User is OK!

    const name = args.join('-').toLowerCase()

    console.log(`[ INFO ] Adding user ${user.ign} to queue "${name}"`)

    // === LOOK FOR QUEUE
    const queue = await Queue.findOne({serverID: message.guild.id, name: name}).lean().exec()

    // if queue not found, abort
    if (!queue) {
        return helper.replyCustomError(message, `Oops! Could not find queue \`${name}\`.`, 'Did you type it right?', '> No queue by that name. Aborting.')
    }

    // if already in the queue
    if (queue.users.includes(message.author.id)) {
        return helper.replyCustomError(message, `Oops! You're already in queue \`${name}\`.`, null, '> User already in queue. Aborting.')
    }

    // if queue is full
    if (queue.taken == queue.capacity) {
        return helper.replyCustomError(message, `Oops! Queue \`${name}\` is full`, null, '> Queue full. Aborting.')
    }
    // Queue is OK!

    // make channel visible to user + write + see prev messages
    await message.guild.channels.cache.get(queue.channelID).createOverwrite(message.author, { 'VIEW_CHANNEL': true, 'SEND_MESSAGES': true, 'READ_MESSAGE_HISTORY': true })

    // post info to channel
    await helper.replyToChannel(message, queue.channelID, 
        `${message.author.username} joined this queue`, 
        `\`${queue.taken + 1}/${queue.capacity}\` ${message.author} \n**IGN**: \`${user.ign}\` \n**Island**: \`${user.island}\``)

    // edit the queue created msg
    const queueListChannel = message.guild.channels.cache.get(message.queueChannel)
    const queueMsg = await queueListChannel.messages.fetch(queue.messageID)
    const queueMsgEmbed = queueMsg.embeds[0]

    queueMsgEmbed.fields[0].value = `${queue.taken + 1} / ${queue.capacity}`    

    await queueMsg.edit(queueMsgEmbed)

    // decrease available queue spots
    await Queue.findByIdAndUpdate(queue._id, { $inc: { taken: 1 }, $push: { users: message.author.id } }).exec()

    // confirmation message
    return helper.replySuccess(message, 'Added you to the queue.', `You're in position ${queue.taken + 1} of ${queue.capacity}.`)
}

module.exports = options
module.exports.execute = execute