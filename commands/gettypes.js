const helper = require('../js/helpers')

/**
 * Get request types    
 */

const options = {

    name: 'gettypes',
    aliases: ['getypes', 'getype', 'gettype', 'showtypes', 'checktype', 'checktypes', 'check'],

    description: 'Show available request types for this server.',
    minArgs: 0,

    roleRestrict: 'requester',

    cooldown: 2,
}

async function execute(message) { 
    console.log('[ INFO ] Fetching server request types...')
    if(message.requesttypes.length == 0) {
        return helper.replySuccess(message, 'All types approved!', 'You can request anything you wish, but keep it cool ;) Good luck!', true)
    }

    return helper.replySuccess(message, 'You can request these:', message.requesttypes.join(', '), true)
}

module.exports = options
module.exports.execute = execute