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
                break
            }
            if(roles.queuemod 
                && roles.queuemod.length > 0
                && !member.roles.cache.some(r => roles.queuemod.includes(r.id))) {
                roleMatch = false
                //console.log('[ DEBUG ] Denying access for queuemod for not having queuemod role.')
            }
            else if(roles.queue
                && roles.queue.length > 0
                && !member.roles.cache.some(r => roles.queue.includes(r.id))) {
                roleMatch = false
                //console.log('[ DEBUG ] Denying access for queuemod for not having queue role.')
            }
            else {
                roleMatch = true
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
        case 'giveaway':
            if(!roles 
                || !roles.giveaway 
                || roles.giveaway.length == 0
                || member.roles.cache.some(r => roles.giveaway.includes(r.id))) {
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
    /**
     * Converts a human-readable time string to milliseconds.
     * @param {string} str - string representing time with a time unit, ex. 1day or 15mins
     * @returns {number} time in millisecons
     * @throws {string}
     */
    parsetime(str) {
        let multiplier, time
        // seconds
        if(/seconds|sec|s$/i.test(str)) {
            multiplier = 1
            time = parseInt(str.replace(/sec|s$/i, ''))
        }
        else if(/minutes|min|mins|m$/i.test(str)) {
            multiplier = 60
            time = parseInt(str.replace(/min|m$/i, ''))
        }
        else if(/hours|h$/i.test(str)) {
            multiplier = 3600
            time = parseInt(str.replace(/hours|h$/i, ''))
        }
        else if(/days|d$/i.test(str)){
            multiplier = 86400
            time = parseInt(str.replace(/days|d$/i, ''))
        }

        if(!time || isNaN(time)) {
            throw 'Oops! I can\'t find a proper time...'
        }

        time *= multiplier * 1000 // for converting to milliseconds

        return time
    },
    /**
     * Returns nicely formatted string that shows the remaining time, used for timers
     * @param {number} remainingTime - milliseconds
     */
    getTimeStr(remainingTime) {
        if (remainingTime >= 0) {
    
            let days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
            let hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            let mins = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
            let secs = Math.floor((remainingTime % (1000 * 60)) / 1000)
    
            let remainingStr = ''
            
            if(days) {
                remainingStr += `${days} days${hours? ', ' + hours + ' hours' : ''}`
            }
            else if(hours > 12 ) {
                remainingStr += `${hours} hours, ${mins} minutes`
            }
            else {
                if(hours < 10) { hours = '0'+ hours}
                if(mins < 10) { mins = '0'+ mins}
                if(secs < 10) { secs = '0'+ secs}
            
                remainingStr += `${hours}:${mins}:${secs}`
            }
    
            return remainingStr
        }
        else {
            return 'No time left'
        }
    },
}