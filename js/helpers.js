const Discord = require('discord.js')
const config = require('../config/config')

module.exports = {
    /**
     * 
     * @param {*} member - Discord API message.member object
     * @param {*} role - role type that is needed (in command roleRestrictions)
     * @param {*} serverRoles - roles that are set up for the server, see /schemas/server.js
     */
    checkRole(member, role, serverRoles) {
        // serverRoles are fetched by message handler in bot.js
        // if there are no server specific settings:
        // - admin things are only allowed for member roles with manage server permissions
        // - all other commands are allowed for @everyone by default

        //console.log(`[ DEBUG ] Checking to see if they have ${role} role`)

        //console.log(`[ DEBUG ] server roles are: ${JSON.stringify(serverRoles)}`)

        let roleMatch = false

        switch(role) {
        case 'moderator':
            if(serverRoles 
                && serverRoles.moderator
                && member.roles.some(r => serverRoles.moderator.includes(r.id))) {
                // Check if they have one of many roles
                // has one of the roles
                //console.log('[ DEBUG ] User is a moderator.')
                roleMatch = true
            }
            break
        case 'requester':
            if(!serverRoles 
                || !serverRoles.requester 
                || member.roles.some(r => serverRoles.requester.includes(r.id))) {
                //console.log('[ DEBUG ] Allowing access for requester.')
                roleMatch = true
            }
            break
        case 'pledger':
            if(!serverRoles 
                || !serverRoles.pledger 
                || member.roles.some(r => serverRoles.pledger.includes(r.id))) {
                //console.log('[ DEBUG ] Allowing access for pledger.')
                roleMatch = true
            }
            break
        default:
            console.log(`[ ERROR ] Invalid role ${role} being checked.`)
            break
        }

        // anyway allow if they are admin
        if (member.hasPermission('ADMINISTRATOR')) {
            //console.log('[ DEBUG ] User is an admin.')
            roleMatch = true
        }

        return roleMatch
    },
    /**
     * Expects the serverRoles object to be checked that it exists and that it contains the role to be checked. 
     * There is no check for unfenied/null in this function
     * @param {*} message - Discord API message object
     * @param {*} role - which role type to check
     * @param {*} serverRoles - see /schemas/server.js
     * @returns {string} roles in human readable format, without pings
     */
    returnRoleNames(message, role, serverRoles) {

        const roleArr = []

        try {
            serverRoles[role].forEach(roleID => {
                roleArr.push(message.guild.roles.get(roleID).name)
            })
            return roleArr.join(', ')
        }
        catch(e) {
            return e.message
        }
    },
    isAdd(raw) {
        if(raw == 'add') return true
        if(raw == 'remove') return false

        throw 'Do you want to add or remove?'
    },
    replyGeneralError(message, err) {
        console.log(`[ ERROR ] ${JSON.stringify(err, null, 2)}`)
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle('Oops!')
            .setDescription('Something went wrong with this command...')
        return message.channel.send(errEmbed)
    },
    replyCustomError(message, title, description, err) {
        if(err) {
            console.log(`[ ERROR ] ${err}`)
        }
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle(title? title : 'Oops!')
            .setDescription(description? description : '')
        return message.channel.send(errEmbed)
    },
    replySuccess(message, title, description) {
        const replyEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
            .setTitle(title? title : 'Success!')
            .setDescription(description? description : '')
        return message.channel.send(replyEmbed)
    },
    replyToChannel(message, channelID, title, description) {
        const queueEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
            .setTitle(title? title : 'Hello!')
            .setDescription(description? description : '')
        message.guild.channels.get(channelID).send(queueEmbed)
    },
}