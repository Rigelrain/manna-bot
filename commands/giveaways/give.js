const reply = require('../../js/reply')
const helper = require('../../js/helpers')
const info = require('../../config/botinfo')
const config = require('../../config/config')
const Giveaway = require('../../schemas/giveaway')

/**
 * Start a giveaway
 */

const options = {
    type: 'giveaways',

    name: 'give',
    aliases: ['giveaway', 'gstart'],

    description: 'Start a giveaway.',
    minArgs: 3,
    usage: '<time> <amount of winners> <what to give>',

    help: info.giveaways + 
    '\nA giveaway can be max 1 week long.\nThe host or a moderator can end the giveaway at anytime using command `end <giveawayID>`.\nIf the prize cannot be delivered for some reason, the host or a moderator can reroll a winner using command `reroll <giveawayID>` within 1 day. Each reroll will get one new winner, so if you need to reroll multiple winners, then use the command as many times as needed.',
    
    example: '1d 1 virtual hug',

    roleRestrict: 'giveaway',

    cooldown: 2,
}

async function execute(message, args) { 

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

    const prize = args.join(' ')

    // === Giveaway info message
    const giveawayEmbed = reply.createEmbed('random', 
        '🎉 Giveaway 🎉', 
        `Given by: ${message.author}\nWinners: ${amount}\n===\n*Prize*: ${prize}\n===\nReact with ${config.emojis.giveaway} to enter!`,
        `Time remaining: ${helper.getTimeStr(duration)}`)
    
    const giveaway = await message.channel.send(giveawayEmbed)

    console.log(`[ INFO ] Created giveaway ${giveaway.id}`)

    message.delete()

    // === Add Reaction collector that will handle joins and end when instructed
    giveaway.react(config.emojis.giveaway)
    
    const collector = giveaway.createReactionCollector((reaction, user) => {
        console.log('Collector fired!')
        // only accept reactions:
        // - giveaway reaction from other users (NOT bot or the giveaway creator)
        // - end reaction from the bot only (so no one else can end it via reactions)
        return (user != giveaway.author && user != message.author && reaction.emoji.name === config.emojis.giveaway) 
            || (user == giveaway.author && reaction.emoji.name === config.emojis.end)
    }, {time: duration})

    // === Setup timer
    const timer = setInterval(function() {
        const currentTime = Date.now()
        const remainingTime = endDate-currentTime
        giveawayEmbed
            .setFooter(`Time remaining: ${helper.getTimeStr(remainingTime)}`)

        giveaway.edit(giveawayEmbed)
        
    }, 5000)

    // === Variables for storing the winners and who joined
    let joined, winners
    
    // === Reaction collector events
    collector.on('collect', (reaction, user) => {
        console.log(`[ DEBUG ] ${user.tag} joined giveaway`)
        if(reaction.emoji.name == config.emojis.end) {
            console.log('Ending triggered')
            // end the giveaway
            collector.stop()
        }
    })

    collector.on('remove', (reaction, user) => {
        console.log(`[ DEBUG ] ${user.tag} left giveaway`)
    })
    
    collector.on('end', collected => {
        console.log(`[ DEBUG ] Giveaway ${giveaway.id} ended, ${collected.size} joined`)

        clearInterval(timer)

        const reaction = collected.get(config.emojis.giveaway)
        let winnerList
        if(reaction && reaction.users) {
            joined = reaction.users.cache.filter(user => !user.bot)
            //console.log(joined)
            winners = joined.random(amount)
            //console.log(winners)
            winnerList = `${winners.join(', ')}`

            // remove winners from the list who's still eligible
            joined = joined.filter(user => !winners.includes(user))
            //console.log(joined)
        }

        // edit the message
        giveawayEmbed
            .setTitle('🎉 Giveaway OVER 🎉')
            .setFooter('Giveaway ended')
            .setTimestamp(Date.now())
            .addField('Winners', !winnerList? 'No winners this time :(' : amount > 1 ? `... And the winners are!\n${winnerList}` : `... And the winner is! ${winnerList}`)

        giveaway.edit(giveawayEmbed)

        if(winnerList) {
            let winnerStr = amount == 1 ? 'We have a winner!' : 'These lucky people have won!'
            winnerStr += `\nThe **${prize}** goes to.... ${winnerList}! Congrats! (Please contact ${message.author} for your prize)`
            message.channel.send(winnerStr) // has to be sent as plain text for the pings to work
        }

        giveaway.reactions.cache.get(config.emojis.giveaway).remove().catch(error => console.log(`[ ERROR ] Failed to remove giveaway reactions: ${JSON.stringify(error)}`))

        // === Save to DB for rerolls
        joined = joined.map(user => user.id)
        Giveaway.create({
            serverID: message.guild.id,
            messageID: giveaway.id,
            hostID: message.author.id,
            prize: prize,
            users: joined,
        })
    })
}

module.exports = options
module.exports.execute = execute