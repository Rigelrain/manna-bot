const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({ 
    userID: String, 
    ign: String, 
    island: String,
})

module.exports = mongoose.model('Userdata', schema, 'userdata')