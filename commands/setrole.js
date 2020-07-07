const info = require('../config/botinfo')
const Server = require('../schemas/server')
const helper = require('../js/helpers')

/**
 * Setup any role
 */

const options = {

    name: 'setrole',
    aliases: ['setroles', 'roles'],

    description: 'Add or remove a role from server settings.',
    minArgs: 3,
    usage: '<add/remove> <roletype> <role>',

    help: info.about_roles,
    
    example: 'moderator add @moderator',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) {

    console.log('[ INFO ] Server setup - role')

    // check whether should add or remove
    const rawAddRemove = args.shift().toLowerCase()
    let isAdd
    try {
        isAdd = helper.isAdd(rawAddRemove)
    }
    catch(e) {
        return helper.replyCustomError(message, e, `Bot usage: ${message.prefix}${options.usage}`)
    }
    console.log(`[ DEBUG ] ${isAdd? 'Adding' : 'Removing'} roles...`)

    const roletype = args.shift().toLowerCase()
    if(!['moderator', 'requester', 'pledger'].includes(roletype)) {
        return helper.replyCustomError(message, 'That\'s not a type of role I\'m looking for...', `You must specify which kinf of a role you are adding. Available options:
        moderator - who can edit bot settings
        requester - who can make requests
        pledger - who can offer to pledge`)
    } 

    // fetch the role
    let roles = []
    let roleNames = [] // this is just for the reply message
    if (!message.mentions.roles.size) { 
        // no role was mentioned, so try if it was written as plain
        // TODO this should probably be all remaining args joined?
        const textRole = args.shift()
        console.log(`[ DEBUG ] Trying to find role ${textRole}`)
        try {
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() == textRole.toLowerCase())
            console.log(role)
            if(!role) { throw 'No role' }
            roles.push(role.id)
            roleNames.push(role.name)
        }
        catch(e) {
            return helper.replyCustomError(message, 'That\'s not a role I\'m looking for...', 'You should mention one or more roles.')
        }
    }
    else {
        // at least one role was mentioned, so add all mentioned roles
        try {
            message.mentions.roles.forEach(r => {
                roles.push(r.id)
                roleNames.push(r.name)
            })
        }
        catch(e) {
            return helper.replyGeneralError(message, e)
        }
    }
    console.log(`[ DEBUG ] ${isAdd? 'Adding' : 'Removing'} roles ${roleNames.join(', ')}`)

    // building mongoose queries, necessary because of nested structure
    const query = 'roles.' + roletype

    if(isAdd) {
        // use addToSet to ensure no role is added twice
        await Server.findOneAndUpdate({serverID: message.guild.id}, { $addToSet: {[query]: {$each: roles}} }, { upsert: true } ).exec()
    }
    else {
        // use pull to remove all mentioned roles
        await Server.findOneAndUpdate({serverID: message.guild.id}, { $pullAll: {[query]: roles} }, { upsert: true} ).exec()
    }

    return helper.replySuccess(message, `${isAdd? 'Adding' : 'Removing'} ${roletype} is a success!`, `${isAdd? 'Added' : 'Removed'} following roles: ${roleNames.join(', ')}`, true)
}

module.exports = options
module.exports.execute = execute