const config = require('../../config/config')
const Discord = require('discord.js')

const helper = require('../../js/helpers')

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
    const prefix = message.prefix

    const commands = message.client.commands

    if(args.length > 0) { // only show one command info, but detailed
        const cmd = commands.get(args[0]) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]))

        if (!cmd) {
            return helper.replyCustomError(message, 'Invalid command parameter', `That's not a valid command, sorry. I can't find any data of ${args[0]}`)
        }

        const helpEmbed = new Discord.MessageEmbed()
            .setColor(config.colors.info)
            .setAuthor(`Help with *${cmd.name}*`, message.client.user.displayAvatarURL)
            .setThumbnail('https://i.imgur.com/kv48dQf.png')
            .setDescription(`All commands should start with the bot prefix \`${prefix}\`\nSee [GitHub for more info](https://github.com/Rigelrain/PledgeBot)`)
            .setFooter('from Rigelrain bot factory') // TODO add a PNG image link in here
        
        if(cmd.type) {
            helpEmbed.addField('Included in feature', `${cmd.type}`)
            helpEmbed
        }

        helpEmbed.addField('Commands',  `**${cmd.name}**` + (cmd.aliases ? ', ' + cmd.aliases.join(', ') : ''), true)
        helpEmbed.addField('Usage', `\`${prefix}${cmd.name} ${cmd.usage? ' ' + cmd.usage : ''}\``, true)

        if (cmd.example) {
            helpEmbed.addField('Example', `\`${prefix}${cmd.name} ${cmd.example}\``, true)
        }
        if(cmd.cooldown) {
            helpEmbed.addField('Cooldown', `${cmd.cooldown}s`)
        }

        helpEmbed.addField('Info', `${cmd.description}${cmd.help? '\n' + cmd.help : '' }`)

        helpEmbed.addField('Notes:', `Do not include <> nor [] - <> means required and [] means optional.\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`)

        return message.channel.send(helpEmbed)
    }
    else { // show synopsis of all commands, plain text (exceeds char limits)
        let helpStr = 'Here are all of my commands!'

        commands.forEach((cmd) => {
            // only show role-restricted commands if member is in a server and they have that role
            if (!cmd.roleRestrict || ( cmd.roleRestrict && message.guild && helper.checkRole(message.member, cmd.roleRestrict) ) ) {

                helpStr += `\n\n**${cmd.name}**` 
                helpStr += cmd.aliases ? ', ' + cmd.aliases.join(', ') + '\n' : '\n'
    
                if(cmd.type) {
                    helpStr += `*Feature*: ${cmd.type}. `
                }
                helpStr += cmd.description
    
                helpStr += `\n\`${prefix}${cmd.name} ${cmd.usage? ' ' + cmd.usage : ''}\``
    
                if (cmd.example) {
                    helpStr += `\nExample: \`${prefix}${cmd.name} ${cmd.example}\``
                }
    
                if(cmd.help) {
                    helpStr += `\nAdditional help available with \`${prefix}help ${cmd.name}\``
                }
    
                if (cmd.roleRestrict) {
                    if(!message.roles || !message.roles[cmd.roleRestrict]) {
                        // if the role is not set up in server settings
                        if(cmd.roleRestrict == 'moderator') {
                            helpStr += '*(Restricted to server admin only)*'
                        }
                        // else: do nothing, is allowed for @everyone
                    }
                    else {
                        helpStr += `\n*(Restricted to ${ helper.returnRoleNames(message, cmd.roleRestrict, message.roles) } only)*`
                    }
                }
    
                
            }
        })

        helpStr += `\n\n**Notes**:\nDo not include <> nor [] - <> means required and [] means optional.\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`

        return message.channel.send(helpStr, {split: true})
    }
}

module.exports = options
module.exports.execute = execute
