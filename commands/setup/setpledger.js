const info = require('../../config/botinfo')
const base = require('./setrole').execute
const helper = require('../../js/helpers')

/**
 * Set requester role    
 * Calls the setrole internally
 */

const options = {
    type: 'donations',

    name: 'setpledger',
    aliases: ['setpledge', 'pledger', 'pledgers'],

    description: 'Add or remove a pledger role from server settings.',
    minArgs: 2,
    usage: '<add/remove> <role>',

    help: info.about_roles,
    
    example: 'add @pledger',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    const baseArgs = ['pledger', ...args]
    base(message, baseArgs)
        .catch(e => {
            helper.replyGeneralError(message, e)
        })
}

module.exports = options
module.exports.execute = execute