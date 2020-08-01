const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = mongoose.Mixed

// giveaways are stored in DB for a while for allowing rerolls
const schema = new Schema({
    serverID: {type: String, required: true},
    channelID: String, // where the giveaway message is
    messageID: String, // message ID of the giveaway
    prize: String,
    hostID: String,
    users: [Mixed], // array of users who have joined the giveaway, but have not won
    expires: Date,
    amountOfWinners: Number,
    ended: { type: Boolean, default: false },
})

schema.index({serverID: 1, ended: 1}, {partialFilterExpression: {ended: false}})
schema.index({serverID: 1, messageID: 1})
schema.index({expires: 1}, { expireAfterSeconds: 172800 }) // 2 days after expires

module.exports = mongoose.model('Giveaway', schema)