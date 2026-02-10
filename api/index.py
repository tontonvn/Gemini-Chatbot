
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Vercelの環境変数からAPIキーを取得
api_key = os.environ.get("API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Python側でGeminiを呼び出す
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(user_message)
        
        return jsonify({
            "reply": response.text,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "python_version": "3.9+"})

if __name__ == '__main__':
    app.run()
