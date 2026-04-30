// メッセージIDを一時的に保存するセット
const processedMessages = new Set();

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  // すでに処理済みのメッセージIDなら無視（連投・再送対策）
  if (processedMessages.has(msg.id)) return;
  processedMessages.add(msg.id);

  // メモリ肥大化防止（古いIDを100件超えたら削除）
  if (processedMessages.size > 100) {
    const firstId = processedMessages.values().next().value;
    processedMessages.delete(firstId);
  }

  const userName = msg.member ? msg.member.displayName : msg.author.username;
  let content = msg.content;

  if (msg.attachments.size > 0) {
    const attachment = msg.attachments.first();
    if (attachment.contentType && attachment.contentType.startsWith("image/")) {
      content = attachment.url;
    }
  }

  if (!content) return;

  try {
    // タイムアウトを長めに設定（10秒）
    await axios.post(process.env.GAS_URL, {
      user: userName,
      text: content
    }, { timeout: 10000 });
    
    console.log(`送信成功: ${userName}[${content}]`);
  } catch (error) {
    console.error("GASへの送信に失敗しました:", error.message);
    // 失敗した場合はIDを削除して、次回の再送を許可する
    processedMessages.delete(msg.id);
  }
});
