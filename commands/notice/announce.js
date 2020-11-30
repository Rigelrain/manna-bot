const reply = require('../../js/reply')
const info = require('../../config/botinfo')
const Notice = require('../../schemas/notice')
const {getOptions, parsetime} = require('../../js/helpers')

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
    const opts = getOptions(args, ['--nolink', '--noembed', '--infinite', '--duration'])
    args = args.filter(x => !opts.includes(x))
    //console.log(opts)
    // === Get expiration time
    let duration = opts.find(x => /^--duration/.test(x))
    if(duration) {
        try {
            duration = parsetime(duration.replace(/^--duration=/, ''))
        }
        catch(e) {
            return reply.customError(message, e, 'If you give a --duration option, you should give the time in seconds, minutes, hours or days. Ex. --duration=1day, --duration=4hours, --duration=15min etc.')
        }
    }
    else {
        duration = 86400 * 1000 // default 1 day
    }
    //console.log(duration)

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
        // Cannot delete the bot activation message, since it needs to stay in the channel where it was sent. It might have additional info for discussion
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
    if(!opts.includes('--infinite')) {
        await Notice.create({
            serverID: message.guild.id,
            channelID: sendChannel.id,
            messageID: notice.id,
            host: message.author.id,
            expires: Date.now() + duration, 
        })
        console.log(`[ INFO ] Created announcement msg ${notice.id} to DB`)

        notice.delete({timeout: duration})
    }

    // === Cleanup possible old notices
    await cleanNotices(message)

    if(opts.includes('--nolink')) {
        // in this case it is assumed the original message can be deleted
        message.delete({timeout: 1000})
    }
}

async function cleanNotices(message) {
    const notices = await Notice.find({ serverID: message.guild.id, expires: {$lte: Date.now()}}, '_id messageID channelID').lean().exec()

    if(!notices || notices.length === 0) {
        console.log('[ INFO ] no notices to cleanup')
        return
    }

    const endables = []

    notices.forEach(notice => {
        endables.push(removeNotice(message, notice))
    })

    await Promise.all(endables)
}

async function removeNotice(message, notice) {
    // === Get the announcement
    const channel = message.guild.channels.cache.get(notice.channelID)
    const announcementMsg = await channel.messages.fetch(notice.messageID)

    // === Delete msg
    announcementMsg.delete()

    // === Delete from DB
    await Notice.findByIdAndDelete(notice._id)
}

module.exports = options
module.exports.execute = execute