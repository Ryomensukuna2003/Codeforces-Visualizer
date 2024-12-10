import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL, // Replace with your Redis URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await client.connect();
})();

export default client;
