const reply = require('../../js/reply')
const helper = require('../../js/helpers')
const info = require('../../config/botinfo')
const config = require('../../config/config')
const Giveaway = require('../../schemas/giveaway')
const end = require('../../js/giveawayend')

/**
 * Start a giveaway
 */

const options = {
    type: 'giveaways',

    name: 'give',
    aliases: ['giveaway', 'gstart'],

    description: 'Start a giveaway.',
    minArgs: 3,
    usage: '<time> <amount of winners> <what to give> ["Longer description in quotes"]',
    
    help: info.giveaways + 
    '\nA giveaway can be max 1 week long.\nA moderator can limit the use of this command to specific channels with the `setgiveaway <channel1> [channel2] [channel3...]` command.\nThe host or a moderator can end the giveaway at anytime using command `end <giveawayID>`.\nIf the prize cannot be delivered for some reason, the host or a moderator can reroll a winner using command `reroll <giveawayID>` within 1 day. Each reroll will get one new winner, so if you need to reroll multiple winners, then use the command as many times as needed.',
    
    example: '1day 1 virtual hug "A hug will be delivered virtually"',

    roleRestrict: 'giveaway',

    cooldown: 2,
}

async function execute(message, args) { 
    // === Check that channel is correct
    if(message.giveawayChannels 
        && message.giveawayChannels.length > 0
        && !message.giveawayChannels.includes(message.channel.id)) {
        return reply.customError(message, 'You cannot use that command here, sorry!')
    }

    // === Get time
    let duration
    try {
        duration = helper.parsetime(args.shift())
    }
    catch(e) {
        return reply.customError(message, e, `Usage: ${message.prefix}${options.name} ${options.usage}. You can give the time in seconds, minutes, hours or days.`)
    }

    if(duration < 5000) {
        return reply.customError(message, 'That\'s not enough time for a decent giveaway...', 'Please give at least 5seconds as the duration of the giveaway.')
    }
    if(duration > 604800000) {
        return reply.customError(message, 'Oops! That\'s a bit too long...', 'A giveaway cannot be longer than one week.')
    }

    const endDate = Date.now() + duration

    // === Get amount of winners
    const amount = args.shift()
    if(isNaN(amount) || amount < 1) {
        return reply.customError(message, 'Oops! Can\'t find the amount of winners...', `Usage: ${message.prefix}${options.name} ${options.usage}. Give the amount of winners as a plain number.`)
    }
    
    // === Get the prize and possible long description
    let prize = args.join(' ')
    const description = prize.split('"')[1]
    if(description && description != '') {
        prize = prize.split('"')[0]
    }

    // === Giveaway info message
    let giveawayEmbed = reply.createEmbed('random', 
        '🎉 Giveaway 🎉', 
        `Given by: ${message.author}\nWinners: ${amount}\n===\n*Prize*: ${prize}\n===${description? '\n' + description + '\n' : ''}\nReact with ${config.emojis.giveaway} to enter!`,
        `Time remaining: ${helper.getTimeStr(duration)}`)
    
    const giveaway = await message.channel.send(giveawayEmbed)

    // === To Database
    let giveawayData = await Giveaway.create({
        serverID: message.guild.id,
        channelID: message.channel.id,
        messageID: giveaway.id,
        hostID: message.author.id,
        prize: prize,
        users: [],
        amountOfWinners: amount,
        expires: Date.now() + duration,
    })

    console.log(`[ INFO ] Created giveaway msg ${giveaway.id}`)

    message.delete()

    // === Add Reaction collector that will handle joins and end when instructed
    giveaway.react(config.emojis.giveaway)
    
    const collector = giveaway.createReactionCollector((reaction, user) => {
        // console.log('Collector fired!')
        // only accept reactions:
        // - giveaway reaction from other users (NOT bot or the giveaway creator)
        return (user != giveaway.author && user != message.author && reaction.emoji.name === config.emojis.giveaway) 
        // || (user == giveaway.author && reaction.emoji.name === config.emojis.end)
    }, {time: duration})

    // === Setup timer
    const timer = setInterval(function() {
        const currentTime = Date.now()
        const remainingTime = endDate-currentTime
        if(remainingTime < 0) {
            clearInterval(timer)
        }
        else {
            giveawayEmbed = giveaway.embeds[0]
            if(giveawayEmbed.fields && giveawayEmbed.fields.length > 0) {
                // there's a winner already, stop timer
                clearInterval(timer)
            }
            else {
                giveawayEmbed
                    .setFooter(`Time remaining: ${helper.getTimeStr(remainingTime)}`)

                giveaway.edit(giveawayEmbed)
            }
        }
    }, 5000)
    
    // === Reaction collector events
    collector.on('collect', (reaction, user) => {
        console.log(`[ DEBUG ] ${user.tag} joined giveaway`)
    })

    collector.on('remove', (reaction, user) => {
        console.log(`[ DEBUG ] ${user.tag} left giveaway`)
    })
    
    collector.on('end', async collected => {
        // === Check that hasn't been ended manually yet
        giveawayData = await Giveaway.findById(giveawayData._id, '_id ended').lean().exec()

        if(giveawayData.ended) {
            return
        }

        console.log(`[ DEBUG ] Giveaway ${giveaway.id} ended, ${collected.size} joined`)

        const reaction = collected.get(config.emojis.giveaway)
        let joined
        if(reaction && reaction.users) {
            joined = reaction.users.cache.filter(user => !user.bot)
        }

        end(giveawayData._id, joined, amount, giveaway, message.channel)
    })
}

module.exports = options
module.exports.execute = execute