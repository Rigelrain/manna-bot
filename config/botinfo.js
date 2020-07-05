/**
 * Exports commonly used descriptions and help messages
 */

module.exports = {
    aboutRoles: `Initially the bot setup can only be done by a server admin (has 'manage server' permissions). The admin can setup roles which can have bot moderator permissions, meaning that members with at least one of these roles can also edit bot settings.
    By default, requesting donations and pledging for donations can be done by anyone (the everyone role). A bot moderator (or server admin) can setup specific roles which the member has to have in order to use these commands.
    **Role types**
    *moderator* - role(s) that can edit bot settings
    *requester* - role(s) that can use \`request\` command
    *pledger* - role(s) that can use \`pledge\` command
    **Note**
    Each role type can have one or more roles specified. So you can have multiple roles which can edit the bot, as well as request or pledge. You can add the same role into all the role types if you need to.`,
    aboutSettings: `You can edit the following settings of the bot:
    *prefix* - Use command \`setprefix <your chosen prefix> [true]\` to setup a custom prefix. Add the 'true' if you do not want whitespace between the prefix and the command (Ex. prefix was set to '!' with no whitespace --> \`!help\`, prefix was set to '!bot' with whitespace --> \`!bot help\`).
    *roles* - Use command \`setroles <roletype> add <@role>\` to add a role to the given roletype list, and use \`setroles <roletype> remove <@role>\` to remove it from the list. See additional info with \`help setroles\`.
    *request types* - Use command \`settypes <add/remove> <request type>\` to limit the kinds of requests the members can make. Ex. if the server has added 'bottles of janx' and 'towels' as request types, then no member can request 'guides'. There are some premade sets that you can adapt and edit.`,
    otherNotes: `General use instructions:
    - It's best practice to give the bot some specific role that you can use to limit the channels the bot can use. Ex. make a DonationBot role that can only access channel #donations.
    - Bot needs *at least* 'Read messages', 'Send messages' and 'Manage messages' permissions for the channel(s) it is supposed to operate in. The manage messages is needed so that the bot can delete the command messages (to keep the channel cleaner) and edit past donations.
    - The bot has no control over how the donations are actually given to the requester. Requester is notified on who pledged and for how much. It is recommended these be handled via DMs.`,
    requests: `Requests have a type and amount/description.
    Type is loosely the unit of the request. If you request 3 hugs, the type is 'hugs'. If you request passionate kiss, the type is 'kiss'. By default you can use any type, but the server might choose to limit these to specific types of donations allowed on the server. The type has to be the last word in your command.
    The amount is simple, it's simply the quantity of the requested item/service. If left blank, by default you are requesting one (1) item/service.
    You can also give a description (quality). This is a free form text describing any details of your request.
    Example1: 
    \`3 hugs\` --> will create a request:
    \`@Manna requests 3 hugs!\`
    Example2:
    \`passionate kiss\` --> will create a request:
    \`@Manna requests 1 kiss! Needs: passionate\`
    Example3:
    \`5 blue in a flower pot roses\` --> will create a request:
    \`@Manna requests 5 roses! Needs: blue in a flower pot\``,
}