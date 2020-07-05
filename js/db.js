const Server = require('../schemas/server')

module.exports = {
    async getServerData(id) {
        const data =  await Server.findOne({serverID: id}, 'prefix channels roles requestTypes').exec()

        // TODO test with no entry in DB!
        console.log(`DB returns: ${JSON.stringify(data, null, 2 )}`)
        if(!data) {
            return undefined
        }

        return data
    },
}