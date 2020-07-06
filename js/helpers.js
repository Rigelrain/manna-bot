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
                && serverRoles.moderator.length > 0
                && member.roles.cache.some(r => serverRoles.moderator.includes(r.id))) {
                // Check if they have one of many roles
                // has one of the roles
                //console.log('[ DEBUG ] User is a moderator.')
                roleMatch = true
            }
            break
        case 'requester':
            if(!serverRoles 
                || !serverRoles.requester 
                || serverRoles.requester.length == 0
                || member.roles.cache.some(r => serverRoles.requester.includes(r.id))) {
                //console.log('[ DEBUG ] Allowing access for requester.')
                roleMatch = true
            }
            break
        case 'pledger':
            if(!serverRoles 
                || !serverRoles.pledger 
                || serverRoles.pledger.length == 0
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
    getProgress(current, max) {
        if(max == 0) return '' // divide by zero guard
        const progress = (current / max ) * 10

        let progressStr = '['
        for(let i = 0; i < progress; i++) {
            progressStr += '+'
        }
        for(let i = progress; i < 10; i++) {
            progressStr += '_'
        }
        progressStr += ']'

        return progressStr
    },
    getRandomColor() {
        const index = Math.floor(Math.random() * config.colors.random.length)
        return config.colors.random[index]
    },
    replyGeneralError(message, err) {
        console.log(`[ ERROR ] ${JSON.stringify(err, null, 2)}`)
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle('Oops!')
            .setDescription('Something went wrong with this command...')
        message.channel.send(errEmbed)
        message.delete({timeout: 1000})
        return
    },
    /**
     * 
     * @param {*} message - Discord message object
     * @param {string} title 
     * @param {string} description 
     * @param {*} err 
     * @param {boolean} freeze - should the message stay in place?
     */
    async replyCustomError(message, title, description, err, freeze) {
        if(err) {
            console.log(`[ ERROR ] ${err}`)
        }
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle(title? title : 'Oops!')
            .setDescription(description? description : '')
        const reply = await message.channel.send(errEmbed)
        message.delete({timeout: 5000})
        if(!freeze) reply.delete({timeout: 5000})
        return
    },
    /**
     * Send a a success-color embed, which will be deleted after 5secs.  
     * The command will be deleted after 1 sec.
     * @param {*} message - Discord message object
     * @param {string} title 
     * @param {string} description 
     * @param {boolean} freeze - should the message stay in place?
     */
    async replySuccess(message, title, description, freeze) {
        const replyEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
            .setTitle(title? title : 'Success!')
            .setDescription(description? description : '')
        const reply = await message.channel.send(replyEmbed)
        message.delete({timeout: 1000})
        if(!freeze) reply.delete({timeout: 5000})
        return
    },
    replyToChannel(message, channelID, title, description) {
        const queueEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
            .setTitle(title? title : 'Hello!')
            .setDescription(description? description : '')
        message.guild.channels.get(channelID).send(queueEmbed)
    },
}