const helper = require('../js/helpers')
const Server = require('../schemas/server')


/**
 * Reset server settings
 */

const options = {

    name: 'reset',
    aliases: ['resetserver', 'serverreset'],

    description: 'Remove all server settings and revert to defaults.',
    minArgs: 0,

    roleRestrict: 'admin',

    cooldown: 2,
}

async function execute(message) { 
    console.log('[ INFO ] Server reset requested...')
    const serverID = message.guild.id

    await Server.findOneAndDelete({serverID: serverID}).exec()
    
    return helper.replySuccess(message, 'All back to normal!', 'Now to just determine what normal really is... Anyway, I\'ve gone back to using my default settings.', true)
}

module.exports = options
module.exports.execute = execute