# Manna
Discord.js bot for asking for donations/crowdfunding and pledging for them.

***[For Developers](#Manna)***

***[For Users](#Manna-in-your-server)***

## Setup
Main file is `bot.js`.  `npm start` will start the bot.

Configuration files are under `/config`. Note that local bot token and Mongo config should only be used in local development phase and are not suitable to be used if your bot is hosted in the cloud! You should never save this kind of sensitive data as a file in the cloud, only as process variables.

### Discord Access configuration (for local development)

Bot token goes in `token.js`. Create if not present:
```
module.exports = {
  token: 'TOKEN HERE'
}
```

### MongoDB configuration (for local development)
MongoDB details go into `mongodb_config.js`. Create if not present:
```
module.exports = {
    path: 'FULL MONGODB URL HERE',
    dbname: 'NAME OF THE DATABASE HERE',
}
```

### Server-specific configurations
Information about the server's configuration (prefix, role IDs etc.) are given to the bot when it is invited to a server. User must have `manage server` permissions to use this command.

It is recommended that you limit the bot's access to specific channel(s) on your server. Make a specific role for this bot, give it permissions to send and manage messages but *not read* on the server level. Then only allow this role to read the channels you want the bot to operate on.

## Deployment
This bot is configured to be deployed to Heroku.

Sensitive tokens should be saved into Heroku Dashboard in Config Vars. In code these are read as `process.env.<key>`. Add the following 'keys' to the Config Vars:
- TOKEN - Discord bot token
- DBPATH - Path to Mongo database in full
- DBNAME - Name of the database with these collections

## Database

### Server schema
```
{
    serverID: String, // ID of the server, cannot be set by commands
    prefix: String,
    disabled: [String], // disabled features, corresponds to command's type
    roles: {
        moderator: String, // ID of role that can edit bot settings
        requester: String, // ID of role that can initiate requests
        pledger: String, // ID of role that can respond to requests
        queue: [String], // IDs of roles that use queues
        queuemod: [String], // IDs of roles that create queues
    },
    requestTypes: [String], // an array of allowed requests
    queueCategory: String, // category to use for queues
    queueChannel: String, // channel where queue messages should go
    queueMsg: String, // message that is added in every queue channel
}
```

### Request schema
```
{
    serverID: String, // ID of the server the request was made
    userID: String, // ID of the user who made the request
    messageID: String, // ID of the message of the request (bot-made)
    request: {
        type: String, // request type (allowed types can be set by server)
        amount: Number, // how much needed total
        remaining: Number, // how much is left unpledged
    },
}
```

### User schema
```
{ 
    userID: String, // ID of the Discord user
    ign: String, // in-game-name
    island: String, // name of their ACNH island
}
```

### Queue schema
```
{
    serverID: String, // ID of the server where the queue was created
    channelID: String, // ID of the created queue channel
    name: String,
    host: String, // user id of the host
    capacity: Number, // total amount of people that the host allows in the queue
    taken: {type: Number, default: 0}, // the amount of slots in queue that have been claimed
    done: {type: Number, default: 0}, // amount of people who are done, and are not waiting anymore
    users: {type: [String], default: []},
}
```

## Queue system
[TBA]

# Manna in your server

## Features 

Manna currently has the following features, which can be turned off by using `disable <feature>`:

* *donations* - use for requests for donations and donating, include commands like `request`, `donate`
* *queues* - use to make special channels to wait in line for something, include commands like `create`, `join`, `set` (giving information to be used in queues)

#### Donations
Requests have a type and amount/description.

Type is loosely the unit of the request. If you request 3 hugs, the type is 'hugs'. If you request passionate kiss, the type is 'kiss'. By default you can use any type, but the server might choose to limit these to specific types of donations allowed on the server. The type has to be the last word in your command.

The amount is simple, it's simply the quantity of the requested item/service. If left blank, by default you are requesting one (1) item/service.

You can also give a description (quality). This is a free form text describing any details of your request.

Example1: `3 hugs` --> will create a request: `@Manna requests 3 hugs!`

Example2: `passionate kiss` --> will create a request: `@Manna requests 1 kiss! Needs: passionate`

Example3: `5 blue in a flower pot roses` --> will create a request: `@Manna requests 5 roses! Needs: blue in a flower pot`

**Request types**
By default members can request all kinds of items/services. This can be configured by adding specific types as allowed in the server.

Use `settype add/remove <type(s)>` to make these changes. Note that all types must be one (1) word. Use for example dashes for multipart-types (ex. bottles-of-janx).

### Queues
A moderator needs to setup queue settings before the queues can be used in the server. This bot needs info about:
* *queue category* - This is where all the new queue channels will appear. You can get the value of the category ID by right-clicking on the category title and selecting Copy ID.
* *queue list channel* - This is where the bot will announce queues being created and ended.

You can also set role restrictions on who can use the queues (see [roles](#Role-types))

Queues are meant for special events, where there are many people wanting to do something and only a few can do it simultaneously. A queue will hold info on the order of participants (first come, first served) and the host can pick the next in line easyli with a command.

For queues to work efficiently, all members who want to be added to a queue need to set their game info first.

*Currently queue system only uses game information suitable for ACNH*

## Server settings
You can edit the following settings of the bot:

* *prefix* - Use command `setprefix <your chosen prefix> [true]` to setup a custom prefix. Add the 'true' if you do not want whitespace between the prefix and the command (Ex. difference of  `!help` and `! help`).
* *roles* - Use command `setroles add <roletype> <@role>` to add a role to the given roletype list, and use `setroles remove <roletype> <@role>` to remove it from the list. See additional info with `help setroles`.
* *request types* - Use command `settypes <add/remove> <request type(s)>` to limit the kinds of requests the members can make. Ex. if the server has added 'bottles-of-janx' and 'towels' as request types, then no member can request 'guides'. There are some premade sets that you can adapt and edit.
* *queues* - You need to be set a *queue category* and a *queue list channel* before the queue system can be used. Use `help queuesetup` for more information.

## Role restrictions

Initially the bot setup can only be done by a server admin (has 'manage server' permissions). The admin can setup roles which can have bot moderator permissions, meaning that members with at least one of these roles can also edit bot settings.

By default, donations and queues can be used by anyone (@everyone role). A bot moderator can setup specific roles which the member has to have in order to use these commands.

### Role types
* *moderator* - role(s) that can edit bot settings
* *requester* - role(s) that can use `request` command
* *pledger* - role(s) that can use `donate` command
* *queuemod* - role(s) that can host queues, note that if *queue* role is set, then that will also act as a restriction to queuemod, if queuemod is not specifically set
* *queue* - role(s) that can join queues

Each role type can have one or more roles specified. So you can have multiple roles which can edit the bot, as well as request or pledge. You can add the same role into all the role types if you need to.

## Best Practices
* It's best practice to give the bot some specific role that you can use to limit the channels the bot can use. Ex. make a Manna role that can only access channel #donations.
* Bot needs *at least* 'Read messages', 'Send messages', 'Manage messages', 'Manage roles', 'Manage channels' permissions for the channel(s) it is supposed to operate in. The manage messages is needed so that the bot can delete the command messages (to keep the channel cleaner) and edit past donations. The manage roles and channels is used for creating and deleting the queue channels and adding people to them.
* The bot has no control over how the donations are actually given to the requester. Requester is notified on who pledged and for how much. It is recommended these be handled via DMs