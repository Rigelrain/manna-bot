const config = require('./config/config')
console.log(`[ START ] ${config.name} - Starting up...`)
const Discord = require('discord.js')
const client = new Discord.Client()

// get sensitive tokens from process.ENV (for production) or from config files (for local development)
const token = process.env.TOKEN || require('./config/token').token
const mongoURL = process.env.DBPATH || require('./config/mongodb_config').path
const mongoDBname = process.env.DBNAME || require('./config/mongodb_config').dbname

const {checkRole} = require('./js/helpers')
const reply = require('./js/reply')
const db = require('./js/db')

// == DATABASE
const mongoose = require('mongoose')
console.log(`[ START ] Connecting to MongoDB... ( ${mongoURL} )`)
mongoose.connect(mongoURL, { // options below
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    dbName: mongoDBname, useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => {
        console.log('[ START ] Database connected')
        const db = mongoose.connection
        db.on('error', console.error.bind(console, 'MongoDB connection error: '))
    })
    .catch(error => {
        console.log(`[ ERROR ] Cannot connect to database: ${error}`)
    })

// == COMMANDS - import commands from dir
client.commands = new Discord.Collection()
const glob = require('glob')
glob(__dirname + '/commands/**/*.js', {}, (err, files)=>{
    // console.log(files)
    for (const file of files) {
        const command = require(file)
        client.commands.set(command.name, command)
        // console.log(`[ DEBUG ] Added command: ${command.name}`);
    }
})

const cooldowns = new Discord.Collection()

// ======== End setup

client.once('ready', () => {
    console.log('[ START ] Ready.')
})

//   ===    Initial bot message when it joins new server   ===
client.on('guildCreate', server => {
    try {
        reply.sendInfo(server.systemChannel, config.prefix)
        console.log(`[ INFO ] Joined server ${server.name}`)
    }
    catch(e) {
        // most likely missing send permissions
        console.log(`[ ERROR ] Joined server ${server.name}, but cannot send welcome msg due to: ${e.message}`)
    }
})

client.on('message', async message => {

    //   ===   CHECK MESSAGE VALIDITY   ===
    // ignore bot messages
    if(message.author.bot) { return }

    // ignore DMs
    if(message.channel.type !== 'text') { return }

    // === Get server data from DB
    const serverData = await db.getServerData(message.guild.id)
    if(!serverData.prefix) serverData.prefix = config.prefix
    const prefix = serverData.prefix

    // if bot is used by mentioning --> send general command help
    if (message.mentions.has(client.user)) {
        return reply.sendInfo(message.channel, prefix, 'Hello there!')
    }

    // ignore messages that dont start with a valid prefix
    if(!message.content.startsWith(prefix)) { return }

    // turn message into array
    const args = message.content.trim().slice(prefix.length).split(/ +/)

    // pull first word (the command) out
    const commandName = args.shift().toLowerCase()

    // get command from name or alias
    const command = client.commands.get(commandName) ||
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) return

    // == CHECK COMMAND OPTIONS ==

    // command disabled
    if(serverData.disabled && serverData.disabled.includes(command.type)) {
        return reply.customError(message, 'Access denied! Resistance is futile!', 'Sorry but this feature has been disabled on this server...')
    }

    // role restricted
    if (command.roleRestrict && !checkRole(message.member, command.roleRestrict, serverData.roles) ) { 
        return reply.customError(message, 'Can\'t allow that', 'You do not have permissions to give that command to me.')
    }

    // argument count
    if (command.minArgs && args.length < command.minArgs) {
        return reply.customError(message, 'Oops! Are you missing something?', `Usage: \`${prefix}${command.name} ${command.usage}\``)
    }

    // == COOLDOWN HANDLING ==
    if (command.cooldown) {
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection())
        }
        const now = Date.now()
        const timestamps = cooldowns.get(command.name)
        const cooldownAmount = (command.cooldown || 3) * 1000
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000
                return reply.customError(message, 'Patience!', `Wait ${timeLeft.toFixed(1)} more second(s) to call this again.`)
            }
        }
        timestamps.set(message.author.id, now)
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
    }

    // == ADDING ALL SERVER DATA TO MESSAGE ==
    for(const setting in serverData) {
        //console.log(`[ DEBUG ] adding server setting ${setting} to ${JSON.stringify(serverData[setting])}`)
        message[setting] = serverData[setting]
    }
    if(!message.requestTypes) message.requestTypes = []

    // == ACTUAL COMMAND CALL ==
    command.execute(message, args)
        .catch(err => {
            reply.generalError(message, err)
        })
}) 

// ======= Login to Discord
console.log('[ START ] Logging in to Discord...')
client.login(token)

// catch and log promise rejections
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error))