const express = require("express");
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios'); // 安定性のためにaxiosに変更

const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(8000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content) return;

  // サーバーでの表示名（ニックネーム）を優先して取得
  const userName = msg.member ? msg.member.displayName : msg.author.username;

  try {
    // GASへデータを送信
    await axios.post(process.env.GAS_URL, {
      user: userName,
      text: msg.content
    });
    console.log(`送信成功: ${userName}[${msg.content}]`);
  } catch (error) {
    console.error("GASへの送信に失敗しました:", error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
