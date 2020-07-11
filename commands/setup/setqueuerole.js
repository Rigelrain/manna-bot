const info = require('../../config/botinfo')
const base = require('./setrole').execute
const reply = require('../../js/reply')

/**
 * Set queuemod role    
 * Calls the setrole internally
 */

const options = {
    type: 'donations',

    name: 'setqueue',
    aliases: ['setqrole', 'queue', 'queuerole', 'queueroles'],

    description: 'Add or remove a queue role from server settings.',
    minArgs: 2,
    usage: '<add/remove> <role>',

    help: info.about_roles,
    
    example: 'add @queue',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    const baseArgs = ['queue', ...args]
    base(message, baseArgs)
        .catch(e => {
            reply.generalError(message, e)
        })
}

module.exports = options
module.exports.execute = execute