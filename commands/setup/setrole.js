const info = require('../../config/botinfo')
const Server = require('../../schemas/server')
const {checkIsAdd} = require('../../js/helpers')
const reply = require('../../js/reply')
const config = require('../../config/config')

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
        isAdd = checkIsAdd(rawAddRemove)
    }
    catch(e) {
        return reply.customError(message, e, `Bot usage: ${message.prefix}${options.usage}`)
    }
    console.log(`[ DEBUG ] ${isAdd? 'Adding' : 'Removing'} roles...`)

    const roletype = args.shift().toLowerCase()
    if(!config.roletypes.includes(roletype)) {
        return reply.customError(message, 'That\'s not a type of role I\'m looking for...', `You must specify which kind of a role you are adding. Available options:
        moderator - who can edit bot settings
        requester - who can make requests
        pledger - who can offer to pledge
        queuemod - who can make queues
        queue - who can join queues`)
    } 

    // fetch the role
    let roles = []
    let roleNames = [] // this is just for the reply message
    if (!message.mentions.roles.size) { 
        // no role was mentioned, so try if it was written as plain
        const textRole = args.join(' ')
        console.log(`[ DEBUG ] Trying to find role ${textRole}`)
        try {
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() == textRole.toLowerCase())
            if(!role) { throw 'No role' }
            roles.push(role.id)
            roleNames.push(role.name)
        }
        catch(e) {
            return reply.customError(message, 'That\'s not a role I\'m looking for...', 'You should mention one or more roles.')
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
            return reply.generalError(message, e)
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

    return reply.success(message, `${isAdd? 'Adding' : 'Removing'} ${roletype} role is a success!`, `${isAdd? 'Added' : 'Removed'} following roles: ${roleNames.join(', ')}`, true)
}

module.exports = options
module.exports.execute = execute