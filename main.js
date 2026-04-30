const express = require("express");
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

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

// --- 重複送信防止用の設定 ---
//const processedMessages = new Set();

client.on('messageCreate', async (msg) => {
  // ボット自身の発言は無視
  if (msg.author.bot) return;

  // すでに処理済みのメッセージIDなら無視（連投・再送対策）
  if (processedMessages.has(msg.id)) return;
  processedMessages.add(msg.id);

  // メモリ肥大化防止（直近100件）
  if (processedMessages.size > 100) {
    const firstId = processedMessages.values().next().value;
    processedMessages.delete(firstId);
  }

  // サーバー内での表示名を優先取得
  const userName = msg.member ? msg.member.displayName : msg.author.username;

  // 1. テキストがある場合は送信
  if (msg.content) {
    await sendToGas(userName, msg.content);
  }

  // 2. 添付ファイル（画像）をすべてループで処理して送信
  if (msg.attachments.size > 0) {
    for (const [id, attachment] of msg.attachments) {
      // 画像ファイル（image/で始まるもの）のみを1枚ずつ送信
      if (attachment.contentType && attachment.contentType.startsWith("image/")) {
        await sendToGas(userName, attachment.url);
      }
    }
  }
});

/**
 * GASへデータを送信する共通関数
 */
async function sendToGas(user, text) {
  try {
    await axios.post(process.env.GAS_URL, {
      user: user,
      text: text
    }, { timeout: 15000 }); // 画像処理を考慮してタイムアウトを15秒に延長
    
    console.log(`送信成功: ${user}[${text}]`);
  } catch (error) {
    console.error("GASへの送信に失敗しました:", error.message);
  }
}

client.login(process.env.DISCORD_TOKEN);
