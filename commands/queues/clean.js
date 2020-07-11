const reply = require('../../js/reply')
const User = require('../../schemas/user')
const Queue = require('../../schemas/queue')

/**
 * Member can delete their data from the database
 */

const options = {
    type: 'queues',

    name: 'clean',

    aliases: ['removeme', 'purge', 'removedata', 'delete'],

    usage: '',
    description: 'Removes your user data from the bot *from all servers*. Also removes you from all queues you are currently in.',

    cooldown: 3,
    minArgs: 0,
}

async function execute(message) {

    const authorID = message.author.id
    console.log(`[ INFO ] > Removing user ${authorID}`)

    // remove the userId from all queues
    await Queue.updateMany({}, { $pullAll: { users: [ authorID ] } }).exec()
        
    // remove the user from user database
    await User.findOneAndDelete({userID: authorID})

    return reply.success(message, 'Deleted!', 'Your data has now been removed.')
}

module.exports = options
module.exports.execute = execute