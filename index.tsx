
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as Lucide from 'lucide-react';

const { Send, Bot, User, Info, ChevronRight, Settings, SendHorizonal } = Lucide;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！画面が表示されましたね。成功です！\n\nAIから返信をもらうには、Vercelの管理画面で「API_KEY」を設定する必要があります。右上のボタンから手順を確認してください。',
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
        throw new Error(data.error || '通信エラー');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'エラーが発生しました。Vercelの設定画面（Settings > Environment Variables）で「API_KEY」が正しく追加されているか確認し、再デプロイしてください。',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-slate-800">Gemini AI Bot</h1>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors"
        >
          <Info className="w-4 h-4" />
          設定ガイド
        </button>
      </nav>

      <main className="flex-1 overflow-hidden relative flex flex-col max-w-4xl mx-auto w-full bg-white shadow-xl border-x">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-slate-600" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-400 animate-pulse" />
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="メッセージを入力..."
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-30 transition-all"
            >
              <SendHorizonal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showGuide && (
          <div className="absolute inset-0 bg-white/95 z-50 p-8 flex flex-col items-center text-center">
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">API設定の手順</h2>
              <div className="space-y-4 text-left bg-white border border-slate-200 p-6 rounded-2xl shadow-lg">
                <p className="text-sm font-bold text-indigo-600 uppercase">1. キーの登録</p>
                <p className="text-xs text-slate-600">Vercelのプロジェクト画面で「Settings」→「Environment Variables」を開きます。</p>
                <div className="bg-slate-50 p-3 rounded border font-mono text-[10px] space-y-1">
                  <div><b>Key:</b> API_KEY</div>
                  <div><b>Value:</b> (取得したGemini APIキー)</div>
                </div>
                <p className="text-sm font-bold text-indigo-600 uppercase">2. 設定の反映</p>
                <p className="text-xs text-slate-600">「Deployments」タブへ行き、最新の履歴の右側にある「...」から「Redeploy」を押してください。</p>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="mt-8 bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-900 transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
