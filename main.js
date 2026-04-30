client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  // 1. 送信データの準備
  const userName = msg.member ? msg.member.displayName : msg.author.username;
  let content = msg.content;

  // 2. 画像（添付ファイル）があるかチェック
  if (msg.attachments.size > 0) {
    // 最初の1枚のURLを取得（LINEは1メッセージ1画像のため）
    const attachment = msg.attachments.first();
    // 画像ファイルの場合のみ、内容をURLに置き換える
    if (attachment.contentType && attachment.contentType.startsWith("image/")) {
      content = attachment.url;
    }
  }

  // 3. テキストも画像も何もない場合は送らない
  if (!content) return;

  try {
    // GASへデータを送信
    await axios.post(process.env.GAS_URL, {
      user: userName,
      text: content
    });
    console.log(`送信成功: ${userName}[${content}]`);
  } catch (error) {
    console.error("GASへの送信に失敗しました:", error.message);
  }
});
