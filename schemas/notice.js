const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    serverID: {type: String, required: true},
    channelID: String, // channel where notice is
    messageID: String, // messageID of the notice
    expires: Date, // when notice should be removed from DB
})

schema.index({serverID: 1, messageID: 1})
schema.index({expires: 1}, { expireAfterSeconds: 1 })

module.exports = mongoose.model('Notice', schema)