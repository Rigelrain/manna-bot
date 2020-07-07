const config = require('./config/config')
console.log(`[ START ] ${config.name} - Starting up...`)
const Discord = require('discord.js')
const client = new Discord.Client()

// file i/o
const fs = require('fs')

// get sensitive tokens from process.ENV (for production) or from config files (for local development)
const token = process.env.TOKEN || require('./config/token').token
const mongoURL = process.env.DBPATH || require('./config/mongodb_config').path
const mongoDBname = process.env.DBNAME || require('./config/mongodb_config').dbname

const helper = require('./js/helpers')
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
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require('./commands/' + file)
    client.commands.set(command.name, command)

    // console.log(`[ DEBUG ] Added command: ${command.name}`);
}

const cooldowns = new Discord.Collection()

// ======== End setup

const helpEmbedTemplate = new Discord.MessageEmbed()
    .setColor(config.colors.info)
    .setAuthor('Manna', 'https://i.imgur.com/kv48dQf.png', 'https://github.com/Rigelrain/PledgeBot')
    .setTitle('Oh wow, a new place!')
    .setDescription('Hi, I\'m Manna! You can see all my commands by using `!manna help`')
    .setFooter('from Rigelrain bot factory')


client.once('ready', () => {
    console.log('[ START ] Ready.')
})

//   ===    Initial bot message when it joins new server   ===
client.on('guildCreate', server => {
    const firstMsgEmbed = new Discord.MessageEmbed(helpEmbedTemplate)

    try {
        server.systemChannel.send(firstMsgEmbed)
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

    // TODO fetch server info from DB
    const serverData = await db.getServerData(message.guild.id)
    let serverPrefix, serverRoles, serverReqTypes
    if(serverData) {
        serverPrefix = serverData.prefix
        serverRoles = serverData.roles
        serverReqTypes = serverData.requestTypes
    }
    const prefix = serverPrefix? serverPrefix : config.prefix

    // if bot is used by mentioning --> send general command help
    if (message.mentions.has(client.user)) {
        const helpMsg = new Discord.MessageEmbed(helpEmbedTemplate)
        helpMsg.setTitle('Hello there!')
        helpMsg.setDescription(`Hi, I'm Manna! You can see all my commands by using \`${prefix}help\``)
        return message.channel.send(helpMsg)
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

    // role restricted
    if (command.roleRestrict && !helper.checkRole(message.member, command.roleRestrict, serverRoles) ) { 
        return helper.replyCustomError(message, 'Can\'t allow that', 'You do not have permissions to give that command to me.')
    }

    // argument count
    if (command.minArgs && args.length < command.minArgs) {
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle('Oops! Are you missing something?')
            .addField('Usage:', `\`${config.prefix}${command.name} ${command.usage}\``)
        return message.channel.send(errEmbed)
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
                const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
                    .setTitle(`Wait ${timeLeft.toFixed(1)} more second(s) to call this again.`)
                return message.channel.send(errEmbed)
            }
        }
        timestamps.set(message.author.id, now)
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
    }

    // == ACTUAL COMMAND CALL ==
    message.serverRoles = serverRoles // save the roles so that commands can use them too
    message.prefix = serverPrefix? serverPrefix : config.prefix // save prefix so that commands can use them too
    message.requesttypes = serverReqTypes? serverReqTypes : []
    command.execute(message, args)
        .catch(err => {
            helper.replyGeneralError(message, err)
        })
})

// ======= Login to Discord
console.log('[ START ] Logging in to Discord...')
client.login(token)

// catch and log promise rejections
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error))

// TODO list:
/**
 * - Add default types
 * - add possibility to limit the amount of requests per day per user
 * - Add queues
 */