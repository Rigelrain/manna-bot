const helper = require('../../js/helpers')
const User = require('../../schemas/user')

/**
 * Member can see what data has been saved
 */

const options = {
    type: 'queues',

    name: 'me',
    aliases: ['myinfo'],

    description: 'Shows the info you\'ve added for the queue message',

    cooldown: 3,
}

async function execute(message) {

    console.log(`[ INFO ] Showing userdata for user ${message.author.id}`)
    const user = await User.findOne({ userID: message.author.id })

    // if userdata not found, abort
    if (!user) {
        return helper.replyCustomError(message, 'Oops! You haven\'t added your info yet.', `Use \`${message.prefix}set your-name | your-island\` to set that up`, '> User hasn\'t added info. Aborting.')
    }

    return helper.replySuccess(message, 'Your info:', `**IGN**: \`${user.ign || '[no data]'}\` \n**Island**: \`${user.island || '[no data]'}\``, true)
}

module.exports = options
module.exports.execute = execute