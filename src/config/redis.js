import Redis from "ioredis";

function createRedisClient() {
    const url = process.env.REDIS_URL;
    if (url) {
        const client = new Redis(url, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
        });
        wireEvents(client);
        return client;
    }

    // Fallback to host/port style
    const options = {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
    };

    // Enable TLS for providers like Upstash when using host/port
    const hostLower = (options.host || "").toLowerCase();
    if (hostLower.includes("upstash.io") || process.env.REDIS_TLS === "true") {
        options.tls = {};
    }

    const client = new Redis(options);
    wireEvents(client);
    return client;
}

function wireEvents(client) {
    client.on('connect', () => {
        console.log("connecting to redis");
    });
    client.on('ready', () => {
        console.log("connected to redis");
    });
    client.on('error', (err) => {
        console.log('Redis error', err);
    });
}

const redis = createRedisClient();
export default redis;