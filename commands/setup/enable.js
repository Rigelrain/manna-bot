const helper = require('../../js/helpers')
const Server = require('../../schemas/server')
const info = require('../../config/botinfo')
const config = require('../../config/config')

/**
 * Reset server settings
 */

const options = {

    name: 'enable',
    aliases: ['+feature'],

    description: 'Enable feature group(s) from the server.',
    minArgs: 1,
    usage: '<feature1> [feature2] [feature3]',

    help: info.features,

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    console.log(`[ INFO ] Feature enabling requested with args ${args.join(', ')} ...`)

    // filter out all args that are not features (see config!)
    const features = args.filter(feat => config.features.includes(feat))

    if(!features || features.length == 0) {
        return helper.replyCustomError(message, 'I couldn\'t see any valid features in that...', `Use \`${message.prefix}help ${options.name}\` for more info about features.`)
    }

    // cannot use findById here, since server info might not exist yet
    const server = await Server.findOneAndUpdate({serverID: message.guild.id}, { $pullAll: {disabled: features}}, {new: true, lean: true}).exec()
    
    return helper.replySuccess(message, 'Feature(s) enabled!', server.disabled && server.disabled.length > 0? `These features are still disabled: ${server.disabled.join(', ')}`: 'No features are disabled in this server', true)
}

module.exports = options
module.exports.execute = execute