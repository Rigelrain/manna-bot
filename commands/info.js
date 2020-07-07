const config = require('../config/config')
const Discord = require('discord.js')
const info = require('../config/botinfo')

const options = {

    name: 'info',
    aliases: ['info+', 'help+', 'generalinfo', 'botinfo', '?'],
    minArgs: 0,

    description: 'Shows general advice and info about the bot. For a list of bot commands use `help`',

    cooldown: 5,
}

async function execute(message) {

    console.log('[ INFO ] Showing info...')
    const helpEmbed = new Discord.MessageEmbed().setColor(config.colors.info)

    helpEmbed.setAuthor('What is this bot?', message.client.user.displayAvatarURL)
    helpEmbed.setThumbnail('https://i.imgur.com/kv48dQf.png')
    helpEmbed.setDescription('see [GitHub for more info](https://github.com/Rigelrain/PledgeBot)')
    helpEmbed.setFooter('from Rigelrain bot factory') // TODO add a PNG image link in here

    for(const part in info) {
        // make the property name more human readable
        let nameStr = part.split('_').join(' ')
        nameStr = nameStr[0].toUpperCase() + nameStr.slice(1)
        helpEmbed.addField(nameStr, info[part])
    }

    message.channel.send(helpEmbed)
}

module.exports = options
module.exports.execute = execute
