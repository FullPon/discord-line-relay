const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("OK"));
app.listen(8000);
const { Client, GatewayIntentBits } = require('discord.js');
const request = require('request');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('messageCreate', msg => {
  if (msg.author.bot) return;

  request.post({
    uri: process.env.GAS_URL,
    headers: { 'Content-Type': 'application/json' },
    json: {
      message: msg.content,
      user: msg.author.username
    }
  });
});

client.login(process.env.DISCORD_TOKEN);
