const reply = require('../../js/reply')
const config = require('../../config/config')
const Server = require('../../schemas/server')

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

async function execute(message, args) { 
    const preset = args.join(' ')
    console.log(`[ INFO ] Replace server request types with preset ${preset}...`)

    if(!(preset in config.reqtypePresets)) {
        return reply.customError(message, 'Can\'t find that preset...', `Available presets are: ${Object.keys(config.reqtypePresets).join(', ')}`)
    }

    const updated = await Server.findOneAndUpdate({ serverID: message.guild.id }, { requestTypes: config.reqtypePresets[preset] }, {lean: true, new: true}).exec()

    console.log(`[ INFO ] Replaced server request types with ${updated.requestTypes}...`)

    return reply.success(message, `Now using a preset ${preset}!`, `You can add/remove types from this set with command \`${message.prefix}settype <add/remove> <type(s)>\``, true)
}

module.exports = options
module.exports.execute = execute