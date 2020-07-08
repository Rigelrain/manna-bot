const helper = require('../../js/helpers')
const User = require('../../schemas/user')

const options = {
    type: 'queues',

    name: 'set',
    aliases: ['setall', 'setuser', 'setinfo'],

    minArgs: 3,
    usage: '<IGN> | <Island name>',
    description: 'Sets your queue display info for the join queue message.',

    example: 'Manna | Mannaland',

    cooldown: 5,
}

async function execute(message, args) {

    // this is to keep all whitespace in names
    const values = args.join(' ').split(' | ')

    if (values.length != 2) {
        return helper.replyCustomError(message, 'Oops! Could not parse what you\'re trying to set.', `Usage: \`${message.prefix}${options.name} ${options.usage}\``)
    }

    console.log(`[ INFO ] Updating userdata for user ${message.author.id}`)

    // update that information in the db
    const newData = await User.findOneAndUpdate({ userID: message.author.id }, { $set: { userID: message.author.id, ign: values[0], island: values[1] } }, { upsert: true, new: true }).exec()

    console.log(`[ INFO ]  > Userdata set to ${newData}`)

    return helper.replySuccess(message, 'Got your info!', `**IGN**: \`${newData.ign || '[no data]'}\` \n**Island name**: \`${newData.island || '[no data]'}\``, true)
}

module.exports = options
module.exports.execute = execute
