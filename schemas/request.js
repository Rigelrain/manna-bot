const mongoose = require('mongoose')
const Schema = mongoose.Schema

const requestSchema = new Schema({
    serverID: String, // ID of the server
    userID: String, // ID of the user who made the request
    messageID: String, // ID of the message of the request (bot-made)
    request: {
        type: String, // request type (allowed types can be set by server)
        amount: Number, // how much needed
    },
})

requestSchema.index({serverID: 1})

module.exports = mongoose.model('Server', requestSchema)