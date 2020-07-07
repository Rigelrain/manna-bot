const helper = require('../../js/helpers')

/**
 * Get server settings    
 */

const options = {

    name: 'checkserver',
    aliases: ['getserver', 'serverinfo', 'serverhelp', 'server'],

    description: 'Show available request types for this server.',
    minArgs: 0,

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message) { 
    console.log('[ INFO ] Fetching server info...')
    let detailStr = `Prefix: ${message.prefix}`

    // add info about available request types
    if(message.requesttypes.length == 0) {
        detailStr += '\nAvailable request types: All types approved!'
    }
    else {
        detailStr += `\nAvailable request types: ${message.requesttypes.join(', ')}`
    }

    //// add info about roles
    detailStr += '\n*Who can use the bot services*'
    // mods
    detailStr += '\nCan moderate bot: '
    if(message.serverRoles && message.serverRoles.moderator && message.serverRoles.moderator.length > 0) {
        detailStr += helper.returnRoleNames(message, 'moderator', message.serverRoles)
    }
    else {
        detailStr += 'server administrator(s)'
    }
    // requesters
    detailStr += '\nCan request: '
    if(message.serverRoles && message.serverRoles.requester && message.serverRoles.requester.length > 0) {
        detailStr += helper.returnRoleNames(message, 'requester', message.serverRoles)
    }
    else {
        detailStr += 'everyone'
    }
    // pledgers
    detailStr += '\nCan donate: '
    if(message.serverRoles && message.serverRoles.pledger && message.serverRoles.pledger.length > 0) {
        detailStr += helper.returnRoleNames(message, 'pledger', message.serverRoles)
    }
    else {
        detailStr += 'everyone'
    }

    return helper.replySuccess(message, 'Here are the current settings in this server:', detailStr, true)
}

module.exports = options
module.exports.execute = execute