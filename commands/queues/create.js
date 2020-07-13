const config = require('../../config/config')
const Discord = require('discord.js')
const {getRandomColor} = require('../../js/helpers')
const reply = require('../../js/reply')
const Queue = require('../../schemas/queue')
const join = require('../../js/queuejoin')
const info = require('../../config/botinfo')

const options = {
    type: 'queues',
    
    name: 'create',
    aliases: ['start', 'open', 'qcreate', 'queuecreate'],

    usage: '<queue name> <capacity>',
    description: 'Creates a new queue with the given <queue name> and <capacity>.',

    help: info.queues + 'The bot will keep track of queues in info messages.\nYou can also set role restrictions on who can use the queues (see about roles)',

    cooldown: 5,
    minArgs: 2,

    roleRestrict: 'queuemod',
}

async function execute(message, args) {
    // console.log(`[ DEBUG ] Creating queue started with args: ${JSON.stringify(args, null, 2)}`);

    if(!(message.queueCategory && message.queueChannel)) {
        return reply.customError(message, 'Oops! Queues have not been setup yet!', `Someone needs to fix that first... See \`${message.prefix}help queuesetup\``)
    }

    if(message.channel.id != message.queueChannel) {
        return reply.customError(message, 'Oops! Wrong channel!', `You need to use ${message.guild.channels.cache.get(message.queueChannel)} to create queues`)
    }

    // === Extract capacity
    const capacity = parseInt(args.pop())
    const queueName = args.join('-').toLowerCase()

    if (isNaN(capacity) || capacity <= 0) {
        return reply.customError(message, 'Oops! Queue capacity needs to be a positive number.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``, `> Cannot create queue because invalid capacity: ${capacity}`)
    }

    // limit queueName length to 20 characters
    if (queueName.length > 20) {
        return reply.customError(message, 'Oops! Name is too long. Max 20 chars.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``, `> Cannot create queue because invalid name length: ${queueName.length}`)
    }

    // === Check that it doesn't exist already
    const existingQueues = await Queue.find({serverID: message.guild.id, name: queueName})
    if(existingQueues.length > 0) {
        return reply.customError(message, 'Oops! A queue with that name already exists. Please choose a different name.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``, '> Duplicate queueName. Aborting.')
    }

    console.log(`[ INFO ] Creating queue with name "${queueName}" and capacity ${capacity}`)

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
        queueChannel = await message.guild.channels.create(queueName, {
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
            .setTitle(`👥 Queue ${queueName} 👥`)
            .setDescription(message.queueMsg ? message.queueMsg : config.queueCreateMsg)
            .addField(`Capacity:  \` ${capacity} \``, `Host: ${message.author}`)
            .addField('Relevant commands:', `Leave queue: \`${message.prefix}leave\` (you will lose this channel and your spot in this queue)\nGet next in line (host only): \`${message.prefix}next\`\nClose queue (host only): \`${message.prefix}close\``)
        queueChannel.send(queueEmbed)
    }
    catch(e) {
        throw `> Error sending the starting message... Details: ${e}`
    }

    // === Reply success, needs to be first so we can save msg id to DB
    const replyEmbed = new Discord.MessageEmbed()
        .setColor(getRandomColor())
        .setTitle(`👤 Queue \`${queueName}\` created. 👤`)
        .setDescription(`Channel: ${queueChannel}`)
        .addField('Slots taken', `0 / ${capacity}`)
        .setFooter(`React with ${config.emojis.queue} to join the queue!`)
    const replymsg = await message.channel.send(replyEmbed)

    // === Add Reaction colelctor that will handle joins and end when instructed
    replymsg.react(config.emojis.queue)
    const filter = (reaction, user) => {
        // only accept reactions:
        // - queue reaction from other users (NOT bot or the queue creator)
        // - end reaction from the bot only (so no one else can end it)
        return (user != replymsg.author && user != message.author && reaction.emoji.name === config.emojis.queue) 
            || (user == replymsg.author && reaction.emoji.name === config.emojis.end)
    }
    
    const collector = replymsg.createReactionCollector(filter)
    
    collector.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
        if(reaction.emoji.name == config.emojis.end) {
            // end the collection
            collector.stop()
            return
        }
        join(queueName, message.prefix, message.queueChannel, user, message.guild)
    })
    
    collector.on('end', () => {
        console.log(`[ DEBUG ] Queue ${queueName} ended.`)
        //remove queue reactions
        replymsg.reactions.cache.get(config.emojis.queue).remove().catch(error => console.log(`[ ERROR ] Failed to remove queue reactions: ${JSON.stringify(error)}`))
    })

    // === Save to DB
    try {
        // add new queue to db
        await Queue.create({
            serverID: message.guild.id,
            channelID: queueChannel.id,
            messageID: replymsg.id,
            name: queueName,
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