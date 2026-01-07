const net = require('net');

const hosts = [
    'ac-2coc05x-shard-00-00.rzd3qql.mongodb.net',
    'ac-2coc05x-shard-00-01.rzd3qql.mongodb.net',
    'ac-2coc05x-shard-00-02.rzd3qql.mongodb.net'
];
const port = 27017;

console.log(`Checking reachability of MongoDB Atlas shards on port ${port}...`);

hosts.forEach(host => {
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`✅ ${host} is reachable on port ${port} (${Date.now() - start}ms)`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`❌ ${host} timed out after 5s`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`❌ ${host} error: ${err.message}`);
        socket.destroy();
    });

    socket.connect(port, host);
});
