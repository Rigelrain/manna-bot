const reply = require('../../js/reply')
const info = require('../../config/botinfo')
const Notice = require('../../schemas/notice')
const {getOptions} = require('../../js/helpers')

/**
 * Add an announcement
 */

const options = {
    type: 'notices',

    name: 'announce',
    aliases: ['notice', 'note', 'addannouncement'],

    description: 'Send an announcement to noticeboard.',
    minArgs: 1,
    usage: '[<options>] [type] ["notice title"] <announcement message>',
    
    help: info.notices,
    
    example: '--nolink info This is a notice!',

    roleRestrict: 'notice',

    cooldown: 2,
}

async function execute(message, args) { 
    // === Get the channel where to post
    if(!message.notices || message.notices.length == 0) {
        return reply.customError(message, 'I don\'t know where to post that...', 'This server needs to setup a channel where to post announcements', null, true)
    }
    const temptype = args.shift().split('\n')
    let type
    if(temptype.length > 1) {
        type = temptype.shift()
        args.unshift(...temptype)
    }
    else {
        type = temptype[0]
    }

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

    // === Get options
    const opts = getOptions(args, ['--nolink', '--noembed'])
    args = args.filter(x => !opts.includes(x))
    //console.log(opts)
    // === Get expiration time
    // TODO add from give command

    // === Get the possible short title
    let msg = args.join(' ')
    const title = msg.split('"')[1]
    if(title && title != '') {
        msg = title
    }

    console.log(`[ DEBUG ] Sending msg ${msg} to channel: ${sendChannel.id}`)

    // === Notice message
    const titleTxt = `📨 ${type.toUpperCase()} 📨`
    let bodyTxt = `Announcement from ${message.author}:\n${msg}`
    if(!opts.includes('--nolink')) {
        bodyTxt += `\nGo to channel ${message.channel} to see what it's all about!`
    }
    let noticeMsg 
    if(opts.includes('--noembed')) {
        noticeMsg = `${titleTxt}\n${bodyTxt}`
    }
    else {
        noticeMsg = reply.createEmbed('random', titleTxt, bodyTxt)
    }
    
    const notice = await sendChannel.send(noticeMsg)

    // === To Database
    await Notice.create({
        serverID: message.guild.id,
        channelID: sendChannel.id,
        messageID: notice.id,
        host: message.author.id,
        expires: Date.now() + 86400 * 1000, // default 1 day
    })

    console.log(`[ INFO ] Created announcement msg ${notice.id}`)

    // Cannot delete the bot activation message, since it needs to stay in the channel where it was sent. It might have additional info for discussion
}

module.exports = options
module.exports.execute = execute