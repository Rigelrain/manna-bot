const config = require('../config/config')
const Giveaway = require('../schemas/giveaway')

module.exports = async function end(giveawayID, joined, noOfWinners, giveawayMsg, channel) {
    let winnerList

    if(joined) {
        const winners = joined.random(noOfWinners)
        winnerList = `${winners.join(', ')}`

        // remove winners from the list who's still eligible
        joined = joined.filter(user => !winners.includes(user))
    }    

    // === Save to DB for rerolls
    joined = joined? joined.map(user => user.id) : []

    const giveawayData = await Giveaway.findByIdAndUpdate(giveawayID, {users: joined, ended: true}, {new: true, lean: true}).exec()

    // edit the message
    const giveawayEmbed = giveawayMsg.embeds[0]
    giveawayEmbed
        .setTitle('🎉 Giveaway OVER 🎉')
        .setFooter('Giveaway ended')
        .setTimestamp(Date.now())
        .addField('Winners', !winnerList? 'No winners this time :(' : noOfWinners > 1 ? `... And the winners are!\n${winnerList}` : `... And the winner is! ${winnerList}`)

    giveawayMsg.edit(giveawayEmbed)

    if(winnerList) {
        let winnerStr = noOfWinners == 1 ? 'We have a winner!' : 'These lucky people have won!'
        winnerStr += `\nThe **${giveawayData.prize}** goes to.... ${winnerList}! Congrats! (Please contact <@${giveawayData.hostID}> for your prize)`

        channel.send(winnerStr) // has to be sent as plain text for the pings to work
    }

    giveawayMsg.reactions.cache.get(config.emojis.giveaway).remove().catch(error => console.log(`[ ERROR ] Failed to remove giveaway reactions: ${JSON.stringify(error)}`))
    giveawayMsg.react(config.emojis.end)
}