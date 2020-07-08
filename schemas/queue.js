const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    serverID: {type: String, required: true},
    channelID: String, // channel created for the queue
    messageID: String, // message where queue was created, in queue list channel
    name: String,
    host: String,
    capacity: {type: Number, min: 1}, // total amount of people that the host allows in the queue
    taken: {type: Number, default: 0, min: 0}, // the amount of slots in queue that have been claimed
    done: {type: Number, default: 0, min: 0}, // amount of people who are done, and are not waiting anymore
    users: {type: [String], default: []},
})

schema.index({serverID: 1})
schema.index({name: 1})

module.exports = mongoose.model('Queue', schema)