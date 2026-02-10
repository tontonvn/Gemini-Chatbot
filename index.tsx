
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Send, Bot, User, Github, CloudLightning, ShieldCheck,
  ExternalLink, Info, ChevronRight, Settings, Lock
} from 'lucide-react';

// 型定義
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// メインコンポーネント (旧App.tsxの内容)
const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！準備ができました。\n\n画面が表示されたということは、プログラムは正常です。もしAIから返信がない場合は、VercelのSettingsで「API_KEY」を設定し、Redeploy（再デプロイ）してください。',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'API Error');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'エラー：APIキーが未設定か、サーバーとの通信に失敗しました。VercelのSettings > Environment Variables で API_KEY を正しく設定し、再デプロイしてください。',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f8fafc]">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">Gemini Bot</h1>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Python Backend</span>
          </div>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${showGuide ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
        >
          <Info className="w-4 h-4" />
          設定ガイド
        </button>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[92%] md:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`px-5 py-3 rounded-2xl shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{m.content}</p>
                    <p className={`text-[10px] mt-1.5 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-400 animate-pulse" />
                </div>
                <div className="bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="max-w-4xl mx-auto relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="AIにメッセージを送る..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-5 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-30 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Guide */}
        {showGuide && (
          <div className="absolute inset-0 md:relative md:w-[400px] bg-white border-l z-40 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">重要：設定手順</h2>
              <button onClick={() => setShowGuide(false)}><ChevronRight /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-900 font-bold mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> VercelでAPIキーを登録
                </p>
                <ol className="text-xs text-indigo-800 space-y-2 list-decimal ml-4">
                  <li>Vercelのプロジェクト画面で <b>Settings</b> を開く</li>
                  <li>左の <b>Environment Variables</b> を選ぶ</li>
                  <li>Keyに <b>API_KEY</b>、Valueに <b>取得したキー</b> を入れて Add を押す</li>
                  <li><b>Deployments</b> タブに行き、最新の履歴の右の「...」から <b>Redeploy</b> を実行する</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// マウント処理
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
