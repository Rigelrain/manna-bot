const helper = require('../../js/helpers')
const Server = require('../../schemas/server')
const info = require('../../config/botinfo')
const config = require('../../config/config')

/**
 * Reset server settings
 */

const options = {

    name: 'disable',
    aliases: ['-feature'],

    description: 'Disable feature group(s) from the server.',
    minArgs: 1,
    usage: '<feature1 OR all> [feature2] [feature3]',

    help: info.features,

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    // safeguard against using commas
    // join into one string, replace all commas with space, split again
    args = args.join(' ').replace(/,/g, ' ').split(/ +/)

    console.log(`[ INFO ] Feature disabling requested with args ${args.join(', ')} ...`)

    let features

    if(args[0].toLowerCase() == 'all') {
        features = config.features
    }
    else {
        // filter out all args that are not features (see config!)
        features = args.filter(feat => config.features.includes(feat))
    }

    if(!features || features.length == 0) {
        return helper.replyCustomError(message, 'I couldn\'t see any valid features in that...', `Use \`${message.prefix}help ${options.name}\` for more info about features.`)
    }

    // cannot use findById here, since server info might not exist yet
    const server = await Server.findOneAndUpdate({serverID: message.guild.id}, { $addToSet: {disabled: {$each: features}}}, {new: true, lean: true}).exec()
    
    return helper.replySuccess(message, 'Feature(s) disabled!', `No one can now use commands of the following types: ${server.disabled.join(', ')}`, true)
}

module.exports = options
module.exports.execute = execute