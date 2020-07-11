const reply = require('../../js/reply')
const join = require('../../js/queuejoin')

const options = {
    type: 'queues',

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
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    const name = args.join('-').toLowerCase()

    await join(name, message.prefix, message.queueChannel, message.author, message.guild)

    // need to delete the command here, since join() is abstacted to not know of the org message object
    message.delete({timeout: 1000})
    return
}

module.exports = options
module.exports.execute = execute