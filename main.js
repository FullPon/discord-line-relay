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
const processedMessages = new Set();

client.on('messageCreate', async (msg) => {
  // ボット自身の発言は無視
  if (msg.author.bot) return;

  // すでに処理済みのメッセージIDなら無視（連投・再送対策）
  if (processedMessages.has(msg.id)) return;
  processedMessages.add(msg.id);

  // メモリ肥大化防止（保存するIDを直近100件に制限）
  if (processedMessages.size > 100) {
    const firstId = processedMessages.values().next().value;
    processedMessages.delete(firstId);
  }

  // 1. ユーザー名の取得（サーバー内ニックネームを優先）
  const userName = msg.member ? msg.member.displayName : msg.author.username;
  
  // 2. 送信内容の準備
  let content = msg.content;

  // 3. 画像（添付ファイル）があるかチェック
  if (msg.attachments.size > 0) {
    const attachment = msg.attachments.first();
    // ファイルが画像形式（image/jpegなど）の場合、URLをコンテンツにする
    if (attachment.contentType && attachment.contentType.startsWith("image/")) {
      content = attachment.url;
    }
  }

  // テキストも画像もない場合は何もしない
  if (!content) return;

  try {
    // GASへデータを送信
    // タイムアウトを10秒に設定し、画像処理の遅延による再送を防ぐ
    await axios.post(process.env.GAS_URL, {
      user: userName,
      text: content
    }, { timeout: 10000 });
    
    console.log(`送信成功: ${userName}[${content}]`);
  } catch (error) {
    console.error("GASへの送信に失敗しました:", error.message);
    
    // 送信に失敗した場合は、再送される可能性を考えてIDをリストから消しておく
    processedMessages.delete(msg.id);
  }
});

client.login(process.env.DISCORD_TOKEN);
