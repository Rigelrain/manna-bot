const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    serverID: {type: String, required: true},
    channelID: String, // channel where notice is
    messageID: String, // messageID of the notice
    host: String, // used to verify that only host+mods can remove
    expires: Date, // when notice should be removed from DB and the channel
})

schema.index({serverID: 1, messageID: 1})
//schema.index({expires: 1}, { expireAfterSeconds: 1 })
schema.index({serverID: 1, expires: 0})

module.exports = mongoose.model('Notice', schema)