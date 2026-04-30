const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 環境変数の読み込み
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GAS_URL = process.env.GAS_URL;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // ボット自身のメッセージは無視
  if (message.author.bot) return;

  // Discordに投稿された内容をGASへ転送
  try {
    let contentText = message.content;

    // 画像が添付されている場合はURLを取得
    if (message.attachments.size > 0) {
      message.attachments.forEach(attachment => {
        contentText += "\n" + attachment.url;
      });
    }

    // GASにデータを送信
    await axios.post(GAS_URL, {
      user: message.author.username,
      text: contentText
    });
    
    console.log(`送信成功: ${message.author.username}[${contentText}]`);
  } catch (error) {
    console.error("GASへの送信エラー:", error.message);
  }
});

client.login(DISCORD_TOKEN);
