const reply = require('../../js/reply')
//const info = require('../../config/botinfo')
const Notice = require('../../schemas/notice')

/**
 * Add an announcement
 */

const options = {
    type: 'notices',

    name: 'announce',
    aliases: ['notice', 'note', 'addannouncement'],

    description: 'Send an announcement to noticeboard.',
    minArgs: 1,
    usage: '[type] ["notice title"] <announcement message>',
    
    help: 'Sending a notice will send a formatted notice message to a specific channel dedicated for the announcements. By default the full message will be sent in the notification. If you want only a portion to be sent, use double quotes (ex. `info "This is notice!" This is some other text`) to show which part of the message should be sent as an announcement.\nIf no type is given (or it doesn\'t match any that is setup for the server) then the announcement will be sent to a default noticeboard channel, if it setup for the server (with type default).',
    
    example: 'info This is a notice!',

    roleRestrict: 'notice',

    cooldown: 2,
}

async function execute(message, args) { 
    // === Get expiration time
    // TODO add from give command

    // === Get the channel where to post
    const temptype = args.shift().split('\n')
    let type
    if(temptype.length > 1) {
        type = temptype.shift()
        args.unshift(...temptype)
    }
    else {
        type = temptype[0]
    }

    console.log(type)
    let typeInfo = message.notices.find(x => x.name === type)
    if (!typeInfo) {
        // check if there's a default channel
        typeInfo = message.notices.find(x => x.name === 'default')
        if(!typeInfo) {
            return reply.customError(message, 'I don\'t know where to post that...', `This server needs to setup a channel where to post announcements like '${type}'`, null, true)

        }
        // the shifted 'type' is a word from the actual message, return it
        args.unshift(type)
        type = 'announcement' // use a default title
    }

    const sendChannel = message.guild.channels.cache.get(typeInfo.channel)

    if(!sendChannel) {
        return reply.customError(message, 'I can\'t find the channel where to post...', `The channel meant for ${type} announcements isn't where it's supposed to be. Please have a moderator setup this announcement type again.`, null, true)
    }

    // === Get the notice info

    // === Get the possible short title
    let msg = args.join(' ')
    const title = msg.split('"')[1]
    if(title && title != '') {
        msg = title
    }

    console.log(`[ DEBUG ] Sending msg ${msg} to channel: ${sendChannel.id}`)

    // === Notice message
    let noticeEmbed = reply.createEmbed('random', 
        `📨 ${type.toUpperCase()} 📨`, 
        `Announcement from ${message.author}:\n${msg}\nGo to channel ${message.channel} to see what it's all about!`)
    
    const notice = await sendChannel.send(noticeEmbed)

    // === To Database
    await Notice.create({
        serverID: message.guild.id,
        channelID: sendChannel.id,
        messageID: notice.id,
        expires: Date.now() + 86400, // default 1 day
    })

    console.log(`[ INFO ] Created announcement msg ${notice.id}`)

    // Cannot delete the bot activation message, since it needs to stay in the channel where it was sent. It might have additional info for discussion
}

module.exports = options
module.exports.execute = execute