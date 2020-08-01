const Giveaway = require('../schemas/giveaway')

module.exports = async function() {
    // Find all giveaways expired 2 days prior
    await Giveaway.deleteMany({ ended: true, expires: {$lte: Date.now() - 172800000}}).exec()
}