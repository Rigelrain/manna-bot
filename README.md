# PledgeBot
Discord.js bot for asking for donations/crowdfunding and pledging for them.

## Setup
Main file is `bot.js`.  `npm start` will start the bot.

Configuration files are under `/config`.

### Discord Access configuration

Bot token goes in `token.js`. Create if not present:
```
{
  "token": "TOKEN HERE"
}
```

### Server-specific configurations
Information about the server's configuration (channel IDs, role IDs etc.) are given to the bot when it is invited to a server. User must have `manage server` permissions to use this command. Without a complete setting the bot will not work.

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
    roles: {
        moderator: String, // ID of role that can edit bot settings
        requester: String, // ID of role that can initiate requests
        pledger: String, // ID of role that can respond to requests
    },
    requesttypes: [String], // an array of allowed requests
}
```

### Request schema
```
{
    serverID: String, // ID of the server, cannot be set by commands
    userID: String, // ID of the user who made the request
    messageID: String, // ID of the message of the request (bot-made)
    request: {
        type: String, // request type (allowed types can be set by server)
        amount: Number, // how much needed
    },
}
```