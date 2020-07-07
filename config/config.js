module.exports = {
    name: 'Manna',
    prefix: '!manna ', // default prefix
    exampleRequests: {
        'Animal Crossing': ['bells', 'NMT', 'flowers', 'stacks', 'star-frags'],
    },
    colors: {
        success: '#baf7bc',
        error: '#f2847c',
        info: '#a8d9ff',
        warn: '#f5d77f',
        random: ['#ffbbcc', '#ffdddd', '#ffccff', '#cceeff', '#ccccee', '#ccbbdd'],
    },

    queueCreateMsg: 'This is the channel where participants can chat about the queue. Please mind not to clog the channel with offtopic chat.',

    nextWaitTime: 300000, // how long a member is kept in queue channel before kick
}