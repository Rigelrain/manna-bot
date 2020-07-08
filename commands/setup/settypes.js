const info = require('../../config/botinfo')
const helper = require('../../js/helpers')
const Server = require('../../schemas/server')

/**
 * Set request types    
 */

const options = {
    type: 'donations',

    name: 'settype',
    aliases: ['settypes', 'addtype', 'addtypes'],

    description: 'Add or remove a request type(s) from the server. A type must be one word and you can give multiple with the same command.',
    minArgs: 2,
    usage: '<add/remove> <type>',

    help: info.request_types,
    
    example: 'add type1 type2 type3',

    roleRestrict: 'moderator',

    cooldown: 2,
}

async function execute(message, args) { 
    console.log('[ INFO ] Server setup - types')

    // check whether should add or remove
    const rawAddRemove = args.shift().toLowerCase()
    let isAdd
    try {
        isAdd = helper.isAdd(rawAddRemove)
    }
    catch(e) {
        return helper.replyCustomError(message, e, `Bot usage: ${message.prefix}${options.usage}`)
    }

    // safeguard against using commas
    // join into one string, replace all commas with space, split again
    let types = args.join(' ').replace(/,/g, ' ').split(/ +/)

    console.log(`[ DEBUG ] ${isAdd? 'Adding' : 'Removing'} types ${types.join(', ')}...`)

    // TODO go through rest of args to see if they're valid? Some kind of regex

    if(isAdd) {
        // use addToSet to ensure no type is added twice
        await Server.findOneAndUpdate({serverID: message.guild.id}, {$addToSet: {requestTypes: {$each: types}}}, { upsert: true} ).exec()
    }
    else {
        // use pull to remove all mentioned types
        await Server.findOneAndUpdate({serverID: message.guild.id}, { $pullAll: {requestTypes: types} }, { upsert: true} ).exec()
    }

    return helper.replySuccess(message, `${isAdd? 'Adding' : 'Removing'} request types succeeded!`, `${isAdd? 'Added' : 'Removed'} following types: ${types.join(' ')}`)
}

module.exports = options
module.exports.execute = execute