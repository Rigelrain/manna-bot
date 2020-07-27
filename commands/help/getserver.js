const {returnRoleNames} = require('../../js/helpers')
const reply = require('../../js/reply')

/**
 * Get server settings    
 */

const options = {

    name: 'checkserver',
    aliases: ['getserver', 'serverinfo', 'serverhelp', 'server'],

    description: 'Show all server settings made for this server.',
    minArgs: 0,

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message) { 
    console.log('[ INFO ] Fetching server info...')
    let detailStr = `Prefix: ${message.prefix}`

    let disabled = null

    //// info about disabled features
    if(message.disabled && message.disabled.length > 0) {
        disabled = message.disabled
        detailStr += `\nDisabled features: ${message.disabled.join(', ')}
        Note! We won't show settings for disabled features here.`
    }

    const donationsEnabled = !(disabled && disabled.includes('donations'))
    const queuesEnabled = !(disabled && disabled.includes('queues'))

    // available request types
    if(donationsEnabled) {
        detailStr += '\n\n'
        if(message.requestTypes.length == 0) {
            detailStr += 'Available request types: All types approved!'
        }
        else {
            detailStr += `Available request types: ${message.requestTypes.join(', ')}`
        }
    }

    // add info about queue settings
    if(queuesEnabled) {
        detailStr += '\n'
        if(message.queueCategory) {
            if(message.guild.channels.cache.get(message.queueCategory)) {
                detailStr += '\nQueue channels will be added under: ' + message.guild.channels.cache.get(message.queueCategory).name
            }
        }
        if(message.queueChannel) {
            detailStr += `\nQueues are listed in channel ${message.guild.channels.cache.get(message.queueChannel)}`
        }
        if(message.queueMsg) {
            detailStr += `\nQueue's will have an info message:
            ${message.queueMsg}`
        }
    }

    //// add info about roles
    detailStr += '\n\n*Who can use the bot services*'
    // mods
    detailStr += '\nCan moderate bot: '
    if(message.roles && message.roles.moderator && message.roles.moderator.length > 0) {
        detailStr += returnRoleNames(message, 'moderator', message.roles)
    }
    else {
        detailStr += 'server administrator(s)'
    }

    if(donationsEnabled) {
        // requesters
        detailStr += '\nCan request: '
        if(message.roles && message.roles.requester && message.roles.requester.length > 0) {
            detailStr += returnRoleNames(message, 'requester', message.roles)
        }
        else {
            detailStr += 'everyone'
        }
        // pledgers
        detailStr += '\nCan donate: '
        if(message.roles && message.roles.pledger && message.roles.pledger.length > 0) {
            detailStr += returnRoleNames(message, 'pledger', message.roles)
        }
        else {
            detailStr += 'everyone'
        }
    }
    
    if(queuesEnabled) {
        // queues
        detailStr += '\nCan start a queue: '
        if(message.roles && message.roles.queuemod && message.roles.queuemod.length > 0) {
            detailStr += returnRoleNames(message, 'queuemod', message.roles)
        }
        else if(message.roles && message.roles.queue && message.roles.queue.length > 0) {
            detailStr += returnRoleNames(message, 'queue', message.roles)
        }
        else {
            detailStr += 'everyone'
        }
        detailStr += '\nCan join a queue: '
        if(message.roles && message.roles.queue && message.roles.queue.length > 0) {
            detailStr += returnRoleNames(message, 'queue', message.roles)
        }
        else {
            detailStr += 'everyone'
        }
    }

    return reply.success(message, 'Here are the current settings in this server:', detailStr, true)
}

module.exports = options
module.exports.execute = execute