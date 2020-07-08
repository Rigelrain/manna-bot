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
    about_roles: `Initially the bot setup can only be done by a server admin (has 'manage server' permissions). The admin can setup roles which can have bot moderator permissions, meaning that members with at least one of these roles can also edit bot settings.
    By default, donations and queues can be used by anyone (the everyone role). A bot moderator can setup specific roles which the member has to have in order to use these commands.
    *Role types*
      *moderator* - role(s) that can edit bot settings
      *requester* - role(s) that can use \`request\` command
      *pledger* - role(s) that can use \`donate\` command
      *queuemod* - role(s) that can host queues, note that if *queue* role is set, then that will also restrict queuemod
      *queue* - role(s) that can join queues
    *Note*
    Each role type can have one or more roles specified.`,
    features: `Manna currently has the following features, which can be turned off by using \`disable <feature>\`:
    *donations* - use for requests for donations and donating, include commands like \`request\`, \`donate\`
    *queues* - use to make special channels to wait in line for something, include commands like \`create\`, \`join\`, \`set\` (giving information to be used in queues)`,
    requests: `Requests have a type and amount/description.
    Type is loosely the unit of the request. If you request 3 hugs, the type is 'hugs'. If you request passionate kiss, the type is 'kiss'. By default you can use any type, but the server might choose to limit these to specific types of donations allowed on the server. The type has to be the last word in your command.
    The amount is simple, it's simply the quantity of the requested item/service. If left blank, by default you are requesting one (1) item/service.
    You can also give a description (quality). This is a free form text describing any details of your request.
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
    queues: `A moderator needs to setup queue settings before the queues can be used in the server. This bot needs info about:
    *queue category* - This is where all the new queue channels will appear. You can get the value of the category ID by right-clicking on the category title and selecting Copy ID.
    *queue list channel* - This is where the bot will announce queues being created and ended.
    You can also set role restrictions on who can use the queues (see about roles)`,
    other_notes: `General use instructions:
    - It's best practice to give the bot some specific role that you can use to limit the channels the bot can use. Ex. make a Manna role that can only access channel #donations.
    - Bot needs *at least* 'Read messages', 'Send messages', 'Manage messages', 'Manage channels' permissions for the channel(s) it is supposed to operate in. The manage messages is needed so that the bot can delete the command messages (to keep the channel cleaner) and edit past donations. The manage channels is used for creating and deleting the queue channels.
    - The bot has no control over how the donations are actually given to the requester. Requester is notified on who pledged and for how much. It is recommended these be handled via DMs.`,
}