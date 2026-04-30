const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Koyebの環境変数から情報を読み込みます
const TOKEN = process.env.DISCORD_TOKEN;
const GAS_URL = process.env.GAS_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // メッセージ内容を読み取る設定
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Bot自身の発言や、メッセージが空の場合は無視します
  if (message.author.bot || !message.content) return;

  // 「誰が[メッセージ]」の形にしてGASに送る準備
  const payload = {
    user: message.member ? message.member.displayName : message.author.username,
    text: message.content
  };

  try {
    // GASにデータを送信 (axiosライブラリを使用)
    await axios.post(GAS_URL, payload);
    console.log(`Sent: ${payload.user}[${payload.text}]`);
  } catch (error) {
    console.error(`Error sending to GAS: ${error.message}`);
  }
});

client.login(TOKEN);
