const reply = require('../../js/reply')
const Notice = require('../../schemas/notice')
const helper = require('../../js/helpers')

/**
 * Remove an announcement
 */

const options = {
    type: 'notices',

    name: 'remove',
    aliases: ['endannouncement'],

    description: 'Remove an announcement. You can get the ID of the announcement by right-clicking the announcement message.',
    minArgs: 1,
    usage: '<announcement message ID>',
    
    example: '123456789123456789',

    roleRestrict: 'notice',

    cooldown: 2,
}

async function execute(message, args) { 
    console.log('[ DEBUG ] Manual removal of an annoucement...')

    // === Get the announcement
    const notice = await Notice.findOne({serverID: message.guild.id, messageID: args[0]}).lean().exec()

    if(message.author.id !== notice.host 
        || !helper.checkRole(message.member, 'moderator', message.roles)) {
        return reply.customError(message, 'Hmm... Doesn\'t look like your own announcement...', 'You can only cancel announcements that are your own, unless you\'re a moderator.')
    }

    // === Get the announcement
    const channel = message.guild.channels.cache.get(notice.channelID)
    const announcementMsg = await channel.messages.fetch(notice.messageID)

    // === Delete msg
    announcementMsg.delete()

    // === Delete from DB
    await Notice.findByIdAndDelete(notice._id)

    return reply.success(message, 'Announcement removed!')
}

module.exports = options
module.exports.execute = execute