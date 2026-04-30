const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GAS_URL = process.env.GAS_URL;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    let contentText = message.content;
    if (message.attachments.size > 0) {
      message.attachments.forEach(attachment => {
        contentText += "\n" + attachment.url;
      });
    }

    // GASへ送信
    await axios.post(GAS_URL, {
      user: message.author.username,
      text: contentText
    });
    
    console.log(`送信成功: ${message.author.username}[${contentText}]`);
  } catch (error) {
    console.error("GAS送信エラー:", error.message);
  }
});

client.login(DISCORD_TOKEN);
