const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios'); // axiosを使う方がエラーが少なく安定します

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // これが重要
  ],
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  // 誰が送ったか、名前を取得
  const userName = msg.member ? msg.member.displayName : msg.author.username;

  const payload = {
    user: userName,
    text: msg.content
  };

  try {
    // GASにデータを送信
    await axios.post(process.env.GAS_URL, payload);
    console.log(`送信成功: ${userName}[${msg.content}]`);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
