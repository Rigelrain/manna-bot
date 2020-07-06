const config = require('../config/config')
const Discord = require('discord.js')

const helper = require('../js/helpers')

const options = {

    name: 'help',
    aliases: ['h', 'commands'],
    minArgs: 0,
    usage: '[command]',

    description: 'Shows list of commands. If a specific command is specified, can show additional help.',

    cooldown: 5,
}
/* == HELP MESSAGE FORMAT ==
 * $NAME ($ALIASES)
 * $DESCRIP
 * Usage:
 *   $USAGE
 * Examples:
 *   $EXAMPLE
 */

async function execute(message, args) {

    console.log(`[ INFO ] Showing help with args : ${JSON.stringify(args)}`)
    const helpEmbed = new Discord.MessageEmbed().setColor(config.colors.info)
    let title
    const prefix = message.prefix

    const commands = message.client.commands

    if(args.length > 0) { // only show one command info, but detailed
        const cmd = commands.get(args[0]) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]))

        if (!cmd) {
            return helper.replyCustomError(message, 'Invalid command parameter', `That's not a valid command, sorry. I can't find any data of ${args[0]}`)
        }

        title = `Help with *${cmd.name}*`

        helpEmbed.addField('Commands',  `**${cmd.name}**` + (cmd.aliases ? ', ' + cmd.aliases.join(', ') : ''), true)
        helpEmbed.addField('Usage', `\`${prefix}${cmd.name} ${cmd.usage? ' ' + cmd.usage : ''}\``, true)
        if (cmd.example) {
            helpEmbed.addField('Example', `\`${prefix}${cmd.name} ${cmd.example}\``, true)
        }
        if(cmd.cooldown) {
            helpEmbed.addField('Cooldown', `${cmd.cooldown}s`)
        }
        helpEmbed.addField('Info', `${cmd.description}${cmd.help? '\n' + cmd.help : '' }`)
    }
    else { // show synopsis of all commands
        commands.forEach((cmd) => {
            // only show role-restricted commands if member is in a server and they have that role
            if (!cmd.roleRestrict || ( cmd.roleRestrict && message.guild && helper.checkRole(message.member, cmd.roleRestrict) ) ) {
    
                let helpStr = cmd.description
    
                helpStr += `\n\`${prefix}${cmd.name} ${cmd.usage? ' ' + cmd.usage : ''}\``
    
                if (cmd.example) {
                    helpStr += `\nExample:\n- \`${prefix}${cmd.name} ${cmd.example}\``
                }
    
                if(cmd.help) {
                    helpStr += `\nAdditional help available with \`help ${cmd.name}\``
                }
    
                if (cmd.roleRestrict) {
                    if(!message.serverRoles || !message.serverRoles[cmd.roleRestrict]) {
                        // if the role is not set up in server settings
                        if(cmd.roleRestrict == 'moderator') {
                            helpStr += '*(Restricted to server admin only)*'
                        }
                        // else: do nothing, is allowed for @everyone
                    }
                    else {
                        helpStr += `\n*(Restricted to ${ helper.returnRoleNames(message, cmd.roleRestrict, message.serverRoles) } only)*`
                    }
                }
    
                helpEmbed.addField(`**${cmd.name}**` + (cmd.aliases ? ', ' + cmd.aliases.join(', ') : ''), helpStr)
            }
        })

        helpEmbed.addField('Notes:', `\nDo not include <> nor [] - <> means required and [] means optional.
        You can send ${prefix} help [command name] to get info on a specific command!`)
    }

    helpEmbed.setAuthor(title? title : 'Bot Help', message.client.user.displayAvatarURL)
    helpEmbed.setThumbnail('https://i.imgur.com/kv48dQf.png')
    helpEmbed.setDescription('see [GitHub for more info](https://github.com/Rigelrain/PledgeBot)')
    helpEmbed.setFooter('from Rigelrain bot factory') // TODO add a PNG image link in here

    message.channel.send(helpEmbed, { split: true })
}

module.exports = options
module.exports.execute = execute
