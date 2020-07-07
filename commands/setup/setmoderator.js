const info = require('../../config/botinfo')
const base = require('./setrole').execute
const helper = require('../../js/helpers')

/**
 * Set moderator role    
 * Calls the setrole internally
 */

const options = {

    name: 'setmoderator',
    aliases: ['setmod', 'mod', 'mods', 'moderator', 'moderators'],

    description: 'Add or remove a moderator role from server settings.',
    minArgs: 2,
    usage: '<add/remove> <role>',

    help: info.about_roles,
    
    example: 'add @moderator',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    const baseArgs = ['moderator', ...args]
    base(message, baseArgs)
        .catch(e => {
            helper.replyGeneralError(message, e)
        })
}

module.exports = options
module.exports.execute = execute