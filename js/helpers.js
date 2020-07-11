const config = require('../config/config')

module.exports = {
    /**
     * 
     * @param {*} member - Discord API message.member object
     * @param {*} role - role type that is needed (in command roleRestrictions)
     * @param {*} roles - roles that are set up for the server, see /schemas/server.js
     */
    checkRole(member, role, roles) {
        // roles are fetched by message handler in bot.js
        // if there are no server specific settings:
        // - admin things are only allowed for member roles with manage server permissions
        // - all other commands are allowed for @everyone by default

        //console.log(`[ DEBUG ] Checking to see if they have ${role} role`)

        //console.log(`[ DEBUG ] server roles are: ${JSON.stringify(roles)}`)

        let roleMatch = false

        switch(role) {
        case 'admin':
            // will check below if the user is admin
            break
        case 'moderator':
            if(roles 
                && roles.moderator
                && roles.moderator.length > 0
                && member.roles.cache.some(r => roles.moderator.includes(r.id))) {
                // Check if they have one of many roles
                // has one of the roles
                //console.log('[ DEBUG ] User is a moderator.')
                roleMatch = true
            }
            break
        case 'requester':
            if(!roles 
                || !roles.requester 
                || roles.requester.length == 0
                || member.roles.cache.some(r => roles.requester.includes(r.id))) {
                //console.log('[ DEBUG ] Allowing access for requester.')
                roleMatch = true
            }
            break
        case 'pledger':
            if(!roles 
                || !roles.pledger 
                || roles.pledger.length == 0
                || member.roles.cache.some(r => roles.pledger.includes(r.id))) {
                //console.log('[ DEBUG ] Allowing access for pledger.')
                roleMatch = true
            }
            break
        case 'queuemod':
            // if no roles at all, auto-allow
            if(!roles) {
                roleMatch = true
            }
            if((!roles.queuemod || roles.queuemod.length == 0) 
                && (!roles.queue || roles.queue.length == 0)) { // neither i set
                roleMatch = true
            }
            // if queuemod is set, check that member has that role
            else if(roles.queuemod && roles.queuemod.length > 0) {
                if(member.roles.cache.some(r => roles.queuemod.includes(r.id))) {
                    roleMatch = true
                }
                // else do not allow!   
            }
            // if instead queues
            else if(roles.queue && roles.queue.length > 0) {
                if(member.roles.cache.some(r => roles.queue.includes(r.id))) {
                    roleMatch = true
                }
            }
            /* if(roleMatch == true) {
                console.log('[ DEBUG ] Allowing access for queuemod.')
            } */
            break
        case 'queue':
            if(!roles 
                || !roles.queue 
                || roles.queue.length == 0
                || member.roles.cache.some(r => roles.queue.includes(r.id))) {
                //console.log('[ DEBUG ] Allowing access for queue.')
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
     * Expects the roles object to be checked that it exists and that it contains the role to be checked. 
     * There is no check for unfenied/null in this function
     * @param {*} message - Discord API message object
     * @param {*} role - which role type to check
     * @param {*} roles - see /schemas/server.js
     * @returns {string} roles in human readable format, without pings
     */
    returnRoleNames(message, role, roles) {

        const roleArr = []

        try {
            roles[role].forEach(roleID => {
                roleArr.push(message.guild.roles.cache.get(roleID).name)
            })
            return roleArr.join(', ')
        }
        catch(e) {
            return e.message
        }
    },
    /**
     * Checks whether a feature is allowed in the server
     * @param {*} message - Discord API message object
     * @param {string} feature - feature to be checked
     */
    checkFeature(message, feature) {
        let featureMatch = true

        if(message.disabled && message.disabled.includes(feature)) featureMatch = false

        return featureMatch
    },
    checkIsAdd(raw) {
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
}