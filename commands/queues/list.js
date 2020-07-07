const helper = require('../../js/helpers')
const Queue = require('../../schemas/queue')

/**
 * List all available queues in the server
 */

const options = {

    name: 'list',
    aliases: ['ls', 'queues', 'a'],

    description: 'Lists all currently active queues.',

    cooldown: 5,
}

async function execute(message) {

    console.log('[ INFO ] Listing queues.')

    // get all queues in database matching current server
    const queues = await Queue.find({serverID: message.guild.id}).exec()

    console.log(`[ INFO ]  > ${queues.length} currently active.`)

    let reply = ''
    queues.forEach((queue) => {
        // ~ reply += `\n<#${elem.channelID}>: `;
        reply += `\n**${queue.name}** (host: <@${queue.host}>): `
        reply += queue.available == 0 ? 'No spaces left.' : `${queue.taken} / ${queue.capacity}.`
    })

    return helper.replySuccess(message, `Currently ${queues.length} active queues.`, reply.length != '' ? reply : 'No active queues to display.', true)
}

module.exports = options
module.exports.execute = execute
