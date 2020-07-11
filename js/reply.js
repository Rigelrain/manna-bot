const Discord = require('discord.js')
const config = require('../config/config')

module.exports= {
    createEmbed(type, title, description, err) {
        if(err) {
            console.log(`[ ERROR ] ${err}`)
        }

        const replyEmbed = new Discord.MessageEmbed()
            .setColor(config.colors[type])
            .setTitle(title? title : (type == 'error' ? 'Oops!' : 'Success!'))
        
        if(description) {
            replyEmbed.setDescription(description)
        }

        return replyEmbed
    },
    /**
     * Sends an embed to a channel
     * @param {*} channel - DJS channel object
     * @param {string} type - error/success/info --> defines embed color
     * @param {string} title - embed title (can be null, then will use default 'Oops!' or 'Success!')
     * @param {string} description - optional
     * @param {string} err - error message that should be logged
     * @param {boolean} freeze - should the message stay in place? If false, will delete the msg after a timeout
     */
    async sendEmbed(channel, type, title, description, err, freeze) {
        if(err) {
            console.log(`[ ERROR ] ${err}`)
        }

        const replyEmbed = new Discord.MessageEmbed()
            .setColor(config.colors[type])
            .setTitle(title? title : (type == 'error' ? 'Oops!' : 'Success!'))
        
        if(description) {
            replyEmbed.setDescription(description)
        }

        const reply = await channel.send(replyEmbed)
        if(!freeze) reply.delete({timeout: 5000})
        return
    },
    async sendInfo(channel, prefix, title, description) {
        const embed = new Discord.MessageEmbed()
            .setColor(config.colors.info)
            .setAuthor('Manna', 'https://i.imgur.com/kv48dQf.png', 'https://github.com/Rigelrain/manna-bot')
            .setTitle(title? title : 'Oh wow, a new place!')
            .setDescription(description? description : `Hi, I'm Manna! You can see all my commands by using \`${prefix}help\``)
            .setFooter('from Rigelrain bot factory')

        await channel.send(embed)
        return
    },
    /**
     * Send a general error message to the same channel where command was given
     * @param {*} message - DJS message object
     * @param {string} err - error message to be logged
     */
    async generalError(message, err) {
        console.log(`[ ERROR ] ${err}`)
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle('Oops!')
            .setDescription('Something went wrong with this command...')
        message.channel.send(errEmbed)
        message.delete({timeout: 1000})
        return
    },
    /**
     * Send a customizable error message to the channel where the command was given
     * @param {*} message - Discord message object
     * @param {string} title 
     * @param {string} description 
     * @param {string} err - error message that can be logged
     * @param {boolean} freeze - should the message stay in place?
     */
    async customError(message, title, description, err, freeze) {
        if(err) {
            console.log(`[ ERROR ] ${err}`)
        }
        const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
            .setTitle(title? title : 'Oops!')
            .setDescription(description? description : '')
        const reply = await message.channel.send(errEmbed)
        message.delete({timeout: 5000})
        if(!freeze) reply.delete({timeout: 5000})
        return
    },
    /**
     * Send a a success-color embed, which will be deleted after 5secs.  
     * The command will be deleted after 1 sec.
     * @param {*} message - Discord message object
     * @param {string} title 
     * @param {string} description 
     * @param {boolean} freeze - should the message stay in place?
     */
    async success(message, title, description, freeze) {
        const replyEmbed = new Discord.MessageEmbed()
            .setColor(config.colors.success)
            .setTitle(title? title : 'Success!')
            .setDescription(description? description : '')
        const reply = await message.channel.send(replyEmbed)
        message.delete({timeout: 1000})
        if(!freeze) reply.delete({timeout: 5000})
        return
    },
    /**
     * Send an embed to a channel, identified by ID
     * @param {*} message - DJS message object
     * @param {string} channelID - ID of the channel where it should send
     * @param {string} title 
     * @param {string} description 
     */
    async sendToChannel(message, channelID, title, description) {
        const queueEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
            .setTitle(title? title : 'Hello!')
            .setDescription(description? description : '')
        message.guild.channels.cache.get(channelID).send(queueEmbed)
    },
}