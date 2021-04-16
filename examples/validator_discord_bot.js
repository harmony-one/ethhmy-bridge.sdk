const Discord = require('discord.js');
const axios = require('axios');

const LOGIN_KEY = ''; // your key
const CHAT_ID = '826252485298618400'; // your chat id
const VALIDATOR_URL = 'https://be1.bridge.hmny.io'; // validator api url

const client = new Discord.Client();

let lastCheck;

const checkLastTime = () => {
  if (!lastCheck || (Date.now() - lastCheck) / 1000 > 60 * 15) {
    lastCheck = Date.now();
    return true;
  }

  return false;
};

setInterval(async () => {
  const res = await axios.get(`${VALIDATOR_URL}/has-stuck`);

  try {
    if (res.data && res.data === 'true' && checkLastTime()) {
      await client.channels.cache.get(CHAT_ID).send('Bridge needs to be restarted!');
      await client.channels.cache
        .get(CHAT_ID)
        .send('@here please check https://bridge.harmony.one/stuck-operations');
    }
  } catch (e) {
    console.error(e);
  }
}, 1 * 1000);

client.login(LOGIN_KEY);
