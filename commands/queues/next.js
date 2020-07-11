const reply = require('../../js/reply')
const Queue = require('../../schemas/queue')
const User = require('../../schemas/user')
const config = require('../../config/config')

const options = {
    type: 'queues',

    name: 'next',

    usage: '[queue-name]',
    description: 'Returns the next in line of your queue. If you have more than one queue, please specify the name of your queue.',

    cooldown: 3,
    minArgs: 0,

    roleRestrict: 'queuemod',
}

// eslint-disable-next-line no-unused-vars
async function execute(message, args) {

    if(!(message.queueCategory && message.queueChannel)) {
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    let queueName = args.join('-').toLowerCase()
    if(!queueName || queueName.length === 0) {
        // maybe command was given in a queue channel
        queueName = message.channel.name
    }

    console.log(`[ DEBUG ] Queue/next called in channel: ${message.channel.name}`)

    console.log(`[ INFO ] > Getting next in line ${queueName}`)

    // look for queue in db, by the host
    const queue = await Queue.findOne({ serverID: message.guild.id, name: queueName, host: message.author.id}).lean().exec()

    // if queue not found, abort
    if (!queue) {
        return reply.customError(message, 'Oops!', `Either \`${queueName}\` doesn't exist or it isn't your queue... Maybe check the spelling? Or use this in the queue channel`, `> No queue ${queueName} found. Aborting.`)
    }

    const nextUserID = queue.users.shift() // the ID of the next-in-line
    if(!nextUserID) {
        return reply.success(message, 'Queue is empty!', null, true)
    }

    // remove user from queue, update the taken
    await Queue.findByIdAndUpdate(queue._id, { 
        $inc: { 
            done: 1,
        }, 
        $pullAll: { 
            users: [ nextUserID ],
        }, 
    })

    const nextUser = await User.findOne({ userID: nextUserID}).exec()

    await reply.sendToChannel(message, queue.channelID, 
        'Next up is...', 
        `User: <@${nextUser.userID}>
        IGN: ${nextUser.ign}
        From: ${nextUser.island}
        ---
        Queue now has ${queue.users.length} members in line.
        There's still room for ${queue.capacity-queue.taken} people.`)

    message.delete()

    // make channel invisible to the next user after a timeout
    setTimeout(async function(){
        await message.guild.channels.cache.get(queue.channelID).createOverwrite(nextUser.userID, { 'VIEW_CHANNEL': false, 'SEND_MESSAGES': false })
    }, config.nextWaitTime)

    return
}

module.exports = options
module.exports.execute = execute