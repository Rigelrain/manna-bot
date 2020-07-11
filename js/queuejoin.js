const User = require('../schemas/user')
const Queue = require('../schemas/queue')
const reply = require('./reply')

/**
 * 
 * @param {string} queueName - name of the queue that user wants to join
 * @param {string} prefix - bot prefix
 * @param {string} listchannel - queue list channel ID
 * @param {*} author - User who wants to join
 * @param {*} guild - Discord API server object
 */
module.exports = async function join(queueName, prefix, listchannel, author, guild) {
    // Get queue list channel so that all errors and success messages can be sent there
    const queueListChannel = guild.channels.cache.get(listchannel)

    if(!queueListChannel) {
        console.log('[ ERROR ] > No queue list channel ID given aborting.')
        return // nothing we can do about it, maybe throw error?
    }

    // === LOOK FOR USER
    const user = await User.findOne({ userID: author.id }).exec()

    // if userdata not found, abort
    if (!user) {
        return reply.sendEmbed(queueListChannel, 'error', 'Oops! You haven\'t added your info yet.', `Use \`${prefix}set\` to set that up`, '> User hasn\'t added info. Aborting.')
    }
    if (!(user.ign && user.island)) {
        return reply.sendEmbed(queueListChannel, 'error', 'Oops! You haven\'t added all of your info yet.', `Make sure you \`${prefix}set\` your IGN and island name.`, `> User ${author} hasn't added info. Aborting.`)
    }
    // User is OK!

    console.log(`[ INFO ] Adding user ${author.tag} to queue "${queueName}"`)

    // === LOOK FOR QUEUE
    const queue = await Queue.findOne({serverID: guild.id, name: queueName}).lean().exec()

    // if queue not found, abort
    if (!queue) {
        return reply.sendEmbed(queueListChannel, 'error', `Oops! Could not find queue \`${queueName}\`.`, 'Did you type it right?', '> No queue by that name. Aborting.')
    }

    // if already in the queue
    if (queue.users.includes(author.id)) {
        return reply.sendEmbed(queueListChannel, 'error', `Oops! You're already in queue \`${queueName}\`.`, null, '> User already in queue. Aborting.')            
    }

    // if queue is full
    if (queue.taken == queue.capacity) {
        return reply.sendEmbed(queueListChannel, 'error', `Oops! Queue \`${queueName}\` is full`, null, '> Queue full. Aborting.')
    }
    // Queue is OK!

    // make channel visible to user + write + see prev messages
    const queueChannel = guild.channels.cache.get(queue.channelID)
    await queueChannel.createOverwrite(author, { 'VIEW_CHANNEL': true, 'SEND_MESSAGES': true, 'READ_MESSAGE_HISTORY': true })

    // post info to channel
    await reply.sendEmbed(queueChannel, 'success', `${author.username} joined this queue`, `\`${queue.taken + 1}/${queue.capacity}\` ${author} \n**IGN**: \`${user.ign}\` \n**Island**: \`${user.island}\``, null, true)
        
    // edit the queue created msg
    const queueMsg = await queueListChannel.messages.fetch(queue.messageID)
    const queueMsgEmbed = queueMsg.embeds[0]

    queueMsgEmbed.fields[0].value = `${queue.taken + 1} / ${queue.capacity}`    

    await queueMsg.edit(queueMsgEmbed)

    // decrease available queue spots
    await Queue.findByIdAndUpdate(queue._id, { $inc: { taken: 1 }, $push: { users: author.id } }).exec()

    // confirmation message
    return reply.sendEmbed(queueListChannel, 'success', 'Added you to the queue.', `You're in position ${queue.taken + 1} of ${queue.capacity}.`)
}