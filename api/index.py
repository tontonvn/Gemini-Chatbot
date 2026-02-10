
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

# Vercelの環境変数からAPIキーを取得
API_KEY = os.environ.get("API_KEY")

@app.route('/api/chat', methods=['POST'])
def chat():
    if not API_KEY:
        return jsonify({
            "error": "API_KEYが設定されていません。VercelのSettingsから設定してください。",
            "status": "error"
        }), 500

    try:
        data = request.json
        user_message = data.get('message', '')
        
        # SDKを使わず、直接GoogleのAPIエンドポイントにリクエストを送る (超軽量)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{"text": user_message}]
            }]
        }
        
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        # レスポンスからテキストを抽出
        if "candidates" in response_data:
            reply = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({
                "reply": reply,
                "status": "success"
            })
        else:
            return jsonify({
                "error": "Gemini APIからの応答が不正です。",
                "details": response_data,
                "status": "error"
            }), 500

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "mode": "lightweight-requests"})

if __name__ == '__main__':
    app.run()
