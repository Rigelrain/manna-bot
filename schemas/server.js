const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serverSchema = new Schema({
    serverID: String, // ID of the server, cannot be set by commands
    prefix: String,
    disabled: [String], // disabled features, corresponds to command's type
    roles: {
        moderator: [String], // IDs of roles that can edit bot settings
        requester: [String], // IDs of roles that can initiate requests
        pledger: [String], // IDs of roles that can respond to requests
        queue: [String], // IDs of roles that use queues
        queuemod: [String], // IDs of roles that create queues
    },
    requestTypes: [String], // an array of allowed requests
    queueCategory: String, // category to use for queues
    queueChannel: String, // channel where queue messages should go
    queueMsg: String, // message that is added in every queue channel
})

serverSchema.index({serverID: 1})

module.exports = mongoose.model('Server', serverSchema)