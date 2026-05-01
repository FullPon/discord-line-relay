import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)
GAS_URL = os.getenv("GAS_URL")

@app.route('/', methods=['POST'])
def handler():
    data = request.json
    if data:
        # 画像URL（attachments）がある場合も抽出する
        attachments = []
        if 'attachments' in data:
            attachments = [a['url'] for a in data['attachments'] if 'url' in a]
            
        payload = {
            "user": data.get('username') or data.get('user') or "Discord",
            "text": data.get('content') or data.get('text') or "",
            "attachments": attachments
        }
        
        requests.post(GAS_URL, json=payload)
        return jsonify({"status": "ok"}), 200

    return jsonify({"status": "no data"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)