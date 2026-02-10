
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
            "error": "APIキーが設定されていません。VercelのSettings > Environment Variables で 'API_KEY' を登録してください。",
            "status": "error"
        }), 500

    try:
        data = request.json
        user_message = data.get('message', '')
        
        # 最新の Gemini 3 Flash モデルを使用
        model = "gemini-3-flash-preview"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{"text": user_message}]
            }]
        }
        
        response = requests.post(url, json=payload, timeout=30)
        response_data = response.json()
        
        if "candidates" in response_data and response_data["candidates"]:
            reply = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({
                "reply": reply,
                "status": "success"
            })
        else:
            error_msg = response_data.get("error", {}).get("message", "Unknown error")
            return jsonify({
                "error": f"APIエラー: {error_msg}",
                "status": "error"
            }), 500

    except Exception as e:
        return jsonify({
            "error": f"サーバーエラー: {str(e)}",
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run()
