const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = mongoose.Mixed

// giveaways are stored in DB for a while for allowing rerolls
const schema = new Schema({
    serverID: {type: String, required: true},
    messageID: String, // message ID of the giveaway
    prize: String,
    hostID: String,
    users: [Mixed], // array of users who have joined the giveaway, but have not won
})

schema.index({serverID: 1, messageID: 1})

module.exports = mongoose.model('Giveaway', schema)