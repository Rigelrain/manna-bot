const reply = require('../../js/reply')
const Queue = require('../../schemas/queue')

/**
 * List all available queues in the server
 */

const options = {
    type: 'queues',

    name: 'list',
    aliases: ['ls', 'queues', 'a'],

    description: 'Lists all currently active queues.',

    cooldown: 5,
    roleRestrict: 'queue',
}

async function execute(message) {

    console.log('[ INFO ] Listing queues.')

    // get all queues in database matching current server
    const queues = await Queue.find({serverID: message.guild.id}).exec()

    console.log(`[ INFO ]  > ${queues.length} currently active.`)

    let replyStr = ''
    queues.forEach((queue) => {
        // ~ reply += `\n<#${elem.channelID}>: `;
        replyStr += `\n**${queue.name}** (host: <@${queue.host}>): `
        replyStr += queue.available == 0 ? 'No spaces left.' : `${queue.taken} / ${queue.capacity}.`
    })

    return reply.success(message, `Currently ${queues.length} active queues.`, replyStr.length != '' ? replyStr : 'No active queues to display.', true)
}

module.exports = options
module.exports.execute = execute
