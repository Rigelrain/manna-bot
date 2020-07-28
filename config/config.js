module.exports = {
    name: 'Manna',
    prefix: '!manna ', // default prefix
    // add all new features (command types) into this list
    features: ['donations', 'queues', 'giveaways'], 
    // add all new role types here
    roletypes: ['moderator', 'requester', 'pledger', 'queuemod', 'queue'],
    // presets for different games
    reqtypePresets: {
        'Animal Crossing': ['bells', 'nmt', 'nmts', 'flower', 'flowers', 'stack', 'stacks', 'star-frag','star-frags', 'item', 'items', 'painting', 'paintings', 'statue', 'statues', 'fossil', 'fossils'],
    },
    colors: {
        success: '#baf7bc',
        error: '#f2847c',
        info: '#a8d9ff',
        warn: '#f5d77f',
        random: ['#ffbbcc', '#ffdddd', '#ffccff', '#cceeff', '#ccccee', '#ccbbdd'],
    },

    emojis: {
        queue: '👥',
        donation: '🎁',
        giveaway: '🎉',
        end: '🚫',
    },

    queueCreateMsg: 'This is the channel where participants can chat about the queue. Please mind not to clog the channel with offtopic chat.',

    nextWaitTime: 300000, // how long a member is kept in queue channel before kick
}