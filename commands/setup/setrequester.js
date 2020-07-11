const info = require('../../config/botinfo')
const base = require('./setrole').execute
const reply = require('../../js/reply')

/**
 * Set requester role    
 * Calls the setrole internally
 */

const options = {
    type: 'donations',

    name: 'setrequester',
    aliases: ['setreq', 'req', 'requester', 'requesters'],

    description: 'Add or remove a requester role from server settings.',
    minArgs: 2,
    usage: '<add/remove> <role>',

    help: info.about_roles,
    
    example: 'add @requester',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    const baseArgs = ['requester', ...args]
    base(message, baseArgs)
        .catch(e => {
            reply.generalError(message, e)
        })
}

module.exports = options
module.exports.execute = execute