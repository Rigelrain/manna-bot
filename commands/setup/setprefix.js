const helper = require('../../js/helpers')
const Server = require('../../schemas/server')

/**
 * Set server prefix   
 */

const options = {

    name: 'prefix',
    aliases: ['setprefix'],

    description: 'Change the prefix on the server. If `true` is also given, will not put a space between the prefix and commands.',
    minArgs: 1,
    usage: '<new prefix> [true]',
    
    example: '!m true',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    let newprefix = args.shift().toLowerCase()

    if(args[0] != 'true') {
        newprefix += ' '
    }

    console.log(`[ DEBUG ] Setting new server prefix to: '${newprefix}'`)

    await Server.findOneAndUpdate({serverID: message.guild.id}, {prefix: newprefix}, { upsert: true} ).exec()

    return helper.replySuccess(message, 'Prefix changed!', `From now on, please use \`${newprefix}\` to call me`)
}

module.exports = options
module.exports.execute = execute