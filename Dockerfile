FROM node:18

WORKDIR /app

# 設定ファイルをコピーしてライブラリをインストール
COPY package*.json ./
RUN npm install

# すべてのファイルをコピー
COPY . .

# ボットを起動
CMD ["node", "main.js"]
