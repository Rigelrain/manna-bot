const config = require('../../config/config')
const Discord = require('discord.js')
const {getRandomColor} = require('../../js/helpers')
const reply = require('../../js/reply')
const Queue = require('../../schemas/queue')

const options = {
    type: 'queues',
    
    name: 'create',
    aliases: ['start', 'open', 'qcreate', 'queuecreate'],

    usage: '<queue name> <capacity>',
    description: 'Creates a new queue with the given <queue name> and <capacity>.',

    cooldown: 5,
    minArgs: 2,

    roleRestrict: 'queuemod',
}

async function execute(message, args) {
    // console.log(`[ DEBUG ] Creating queue started with args: ${JSON.stringify(args, null, 2)}`);

    if(!(message.queueCategory && message.queueChannel)) {
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    // === Extract capacity
    const capacity = parseInt(args.pop())
    const name = args.join('-').toLowerCase()

    if (isNaN(capacity) || capacity <= 0) {
        return reply.customError(message, 'Oops! Queue capacity needs to be a positive number.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``, `> Cannot create queue because invalid capacity: ${capacity}`)
    }

    // limit name length to 20 characters
    if (name.length > 20) {
        return reply.customError(message, 'Oops! Name is too long. Max 20 chars.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``, `> Cannot create queue because invalid name length: ${name.length}`)
    }

    // === Check that it doesn't exist already
    const existingQueues = await Queue.find({serverID: message.guild.id, name: name})
    if(existingQueues.length > 0) {
        return reply.customError(message, 'Oops! A queue with that name already exists. Please choose a different name.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``, '> Duplicate name. Aborting.')
    }

    console.log(`[ INFO ] Creating queue with name "${name}" and capacity ${capacity}`)

    // === Creating the new queue channel
    // create channel w/ perms (only allow needed people access to channel)
    const permissions = [
        { id: message.client.user, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_ROLES'] }, // the bot can send and manage the channel and permissions
        { id: message.author, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] }, // queue host can see and send
        { id: message.guild.id, deny: ['VIEW_CHANNEL'] }, // @everyone cannot
    ]

    // add permissions for moderators, if applicable (server admin can anyway always see!)
    if(message.roles && message.roles.moderator && message.roles.moderator.length > 0) {
        message.roles.moderator.forEach(role => {
            permissions.push({
                id: role, 
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES','READ_MESSAGE_HISTORY'],
            }) 
        })
    }

    let queueChannel
    try {
        queueChannel = await message.guild.channels.create(name, {
            type: 'text',
            parent: message.queueCategory,
            permissionOverwrites: permissions,
        })
    }
    catch(e) {
        throw `> Error creating the channel, aborting... Details: ${e}`
    }

    // === Sending the info message to the new channel
    try {
        const queueEmbed = new Discord.MessageEmbed()
            .setColor(config.colors.info)
            .setTitle(`👤 Queue ${name} 👤`)
            .setDescription(message.queueMsg ? message.queueMsg : config.queueCreateMsg)
            .addField(`Capacity:  \` ${capacity} \``, `Host: ${message.author}`)
            .addField('Relevant commands:', `Leave queue: \`${message.prefix}leave\` (you will lose this channel and your spot in this queue)
    Get next in line (host only): \`${message.prefix}next\`
    Close queue (host only): \`${message.prefix}close\``)
        queueChannel.send(queueEmbed)
    }
    catch(e) {
        throw `> Error sending the starting message... Details: ${e}`
    }

    // === Reply success, needs to be first so we can save msg id to DB
    const replyEmbed = new Discord.MessageEmbed()
        .setColor(getRandomColor())
        .setTitle(`👤 Queue \`${name}\` created. 👤`)
        .setDescription(`Channel: ${queueChannel}`)
        .addField('Slots taken', `0 / ${capacity}`)
    const replymsg = await message.channel.send(replyEmbed)

    // === Add Reaction watcher
    // TODO implement reactons for joining

    // === Save to DB
    try {
        // add new queue to db
        await Queue.create({
            serverID: message.guild.id,
            channelID: queueChannel.id,
            messageID: replymsg.id,
            name: name,
            host: message.author.id,
            capacity: capacity,
        })
    }
    catch(e) {
        message.guild.channels.cache.get(queueChannel.id).delete()
        replymsg.delete()
        throw `> Error saving to DB, aborting... Details: ${e}`
    }

    // remove the command message
    message.delete()
    return
}

module.exports = options
module.exports.execute = execute