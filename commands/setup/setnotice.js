const reply = require('../../js/reply')
const Server = require('../../schemas/server')

/**
 * Set notice noticeTypes to the server
 */

const options = {
    noticeType: 'notices',

    name: 'setnoticeboard',
    aliases: ['announcementsetup', 'nset', 'setannouncement'],

    description: 'Add noticeType of notice with a channel where announcements of this noticeType should go. Give a "default" noticeType ',
    minArgs: 2,
    usage: '<noticeType> <channel>',
    
    example: 'info #examplechannel',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    const noticeType = args.shift()
    // get the queue channel from mentions
    if(!message.mentions.channels.size) {
        return reply.customError(message, 'No channel?', `You need to mention a channel in your setup message. Usage: ${message.prefix}${options.usage}`)
    }
    const channel = await message.mentions.channels.first()

    const newNotice = {
        name: noticeType,
        channel: channel.id,
    }

    console.log(`[ DEBUG ] Update server with notice noticeType '${noticeType}' and channel ${channel.id}...`)

    // === Find server to update
    // cannot use findById here, since server info might not exist yet
    const server = await Server.findOne({ serverID: message.guild.id }).exec()
    let updated
    
    // first time setup
    if(!server) {
        await Server.create([{
            serverID: message.guild.id,
            notices: [newNotice],
        }])
        console.log('[ DEBUG ] New server info created.')
        return reply.success(message, `Announcements for '${noticeType}' set!`, `I'll use ${channel} to announce any notices of this type`, true)
    }

    // === Updating server info
    const updateable = server.notices.findIndex(x => x.name === noticeType)
        
    // server does not have this noticeType setup yet
    if(updateable < 0) {
        server.notices.push(newNotice)
        updated = await server.save()
    }
    // old noticeType needs to be updated
    else {
        server.notices[updateable] = newNotice
        updated = await server.save()
    }

    console.log(`[ DEBUG ] Updated server notices to ${JSON.stringify(updated.notices, null, 2)}`)

    return reply.success(message, `Announcements for '${noticeType}' set!`, `I'll use ${channel} to announce any notices of this type`, true)
}

module.exports = options
module.exports.execute = execute