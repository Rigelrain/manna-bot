const info = require('../../config/botinfo')
const base = require('./setrole').execute
const reply = require('../../js/reply')

/**
 * Set queuemod role    
 * Calls the setrole internally
 */

const options = {
    type: 'donations',

    name: 'setqueuemod',
    aliases: ['setqmod', 'queuemod', 'queuemods'],

    description: 'Add or remove a queuemod role from server settings.',
    minArgs: 2,
    usage: '<add/remove> <role>',

    help: info.about_roles,
    
    example: 'add @queuemod',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    const baseArgs = ['queuemod', ...args]
    base(message, baseArgs)
        .catch(e => {
            reply.generalError(message, e)
        })
}

module.exports = options
module.exports.execute = execute