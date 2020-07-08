const helper = require('../../js/helpers')
const config = require('../../config/config')

/**
 * Replace all server request types with a preset   
 */

const options = {
    type: 'donations',

    name: 'usepreset',

    description: 'Replace your server\'s request types with a preset.',
    minArgs: 1,
    usage: '<preset name>',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message) { 
    console.log('[ INFO ] Fetching server request type presets...')

    let msg = ''

    for(const preset in config.reqtypePresets) {
        msg += `${preset}: ${config.reqtypePresets[preset].join(', ')}\n`
    }

    msg += `\nTo use a preset as server request types, use command \`${message.prefix}usepreset <preset name>\`. This will override all your server's current request types!
    After using a preset, you can edit it normally by using \`${message.prefix}setype <add/remove> <type(s)>\`.`

    return helper.replySuccess(message, 'Available preset names and values', msg, true)
}

module.exports = options
module.exports.execute = execute