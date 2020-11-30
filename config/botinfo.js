/**
 * Exports commonly used descriptions and help messages
 */

module.exports = {
    about_manna: `Manna is a donation/crowdsourcing bot suitable for many different kinds of situations.
If you feel that Manna could do more, do not hesitate to contact the dev through Github!`,
    about_settings: `You can edit the following settings of the bot:
- prefix
- roles
- request types
- queues: You need to be set a queue category and a queue list channel before the queue system can be used.`,
    about_roles: `Initially the bot setup can only be done by a server admin (has 'manage server' permissions). By default, donations, queues and giveaways can be used by anyone (the everyone role). 
**Role types**
*moderator* - role(s) that can edit bot settings
*requester* - role(s) that can use \`request\` command
*pledger* - role(s) that can use \`donate\` command
*queuemod* - role(s) that can host queues, note that if *queue* role is set, then that will also restrict queuemod
*queue* - role(s) that can join queues
*giveaway* - role(s) that can make giveaways`,
    features: `Manna currently has the following features, which can be turned off by using \`disable <feature>\`:
*donations* - use for requests for donations and donating, include commands like \`request\`, \`donate\`
*queues* - use to make special channels to wait in line for something, include commands like \`create\`, \`join\`, \`set\` (giving information to be used in queues)
*giveaways* - use to make giveaways, include commands like \`give\`, \`reroll\`
*announcements* - use to make announcements to defined announcement channels, include commands like \`announce\`, \`remove\``,
    requests: `Requests have a type and amount/description.
Example1: 
\`3 hugs\` --> will create a request:
\`@Manna requests 3 hugs!\`
Example2:
\`passionate kiss\` --> will create a request:
\`@Manna requests 1 kiss! Details: passionate\`
Example3:
\`5 blue in a flower pot roses\` --> will create a request:
\`@Manna requests 5 roses! Details: blue in a flower pot\``,
    request_types: 'By default members can request all kinds of items/services. You can add specific types as allowed in the server using `settype add/remove <type(s)>`. Note that all types must be one (1) word. Use for example dashes for multipart-types (ex. bottles-of-janx).',
    queues: `A moderator needs to setup queue settings (use \`queuesetup\`) before the queues can be used in the server. This bot needs info about:
*queue category* - This is where all the new queue channels will appear. You can get the value of the category ID by right-clicking on the category title and selecting Copy ID.
*queue list channel* - This is the only channel where queues can be created.`,
    giveaways: `You must specify the length of the giveaway and the amount of winners.
*Time*: Specify time unit! Ex. 10s (10 seconds), 15m (15 minutes), 2h (two hours), 1d (one day)
*Amount of winners*: give as a plain number. Ex. 1, 10, 50
Others join the giveaway by reacting and once the giveaway ends, the bot will randomly choose a winner.`,
    notices: 'Sending a notice will send a formatted notice message to a specific channel dedicated for the announcements. By default the full message will be sent in the notification. If you want only a portion to be sent, use double quotes (ex. `info "This is notice!" This is some other text`) to show which part of the message should be sent as an announcement.\nIf no type is given (or it doesn\'t match any that is setup for the server) then the announcement will be sent to a default noticeboard channel, if it\'s setup for the server (with type default).' + 
    '\nUtilize options:' + 
    '\n--nolink --> there will be no link to the original announcement in the announcement, ideal for general announcements' + 
    '\n--noembed --> announcement will be made as plain text instead of an embed' + 
    '\n--infinite --> announcement won\'t expire, you have to delete it manually if needed' + 
    '\n--duration --> how long the announcement is valid, after this it will be automatically removed',
    other_notes: `General use instructions:
- It's best practice to give the bot some specific role that you can use to limit the channels the bot can use. Ex. make a Manna role that can only access channel #donations.
- Bot needs *at least* 'Read messages', 'Send messages', 'Manage messages', 'Manage roles', 'Manage channels' permissions for the channel(s) it is supposed to operate in. The manage messages is needed so that the bot can delete the command messages (to keep the channel cleaner) and edit past donations. The manage roles and channels is used for creating and deleting the queue channels and adding people to them.
- The bot has no control over how the donations are actually given to the requester. Requester is notified on who pledged and for how much. It is recommended these be handled via DMs.`,
}