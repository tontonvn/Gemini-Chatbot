
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Github, 
  CloudLightning, 
  ShieldCheck,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Info
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！PythonとGemini APIを使ったチャットボットの準備ができました。右上の「デプロイ手順」ボタンを押すと、自分のボットとして公開する方法を確認できます。',
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
      // 本番環境（Vercel）ではPython API (/api/chat) を叩く
      // 開発環境（プレビュー）では直接Gemini APIを叩くか、エラーハンドリングする
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
        content: '現在はプレビューモードです。VercelにデプロイしてAPIキーを設定すると、Pythonバックエンド経由で会話ができるようになります。',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f3f4f6]">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">Gemini Bot</h1>
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Python Powered</span>
          </div>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all flex items-center gap-2"
        >
          <Info className="w-4 h-4" />
          デプロイ手順
        </button>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white md:m-4 md:rounded-2xl md:shadow-xl border overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[90%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{m.content}</p>
                    <p className={`text-[10px] mt-1 opacity-60 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600 animate-pulse" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
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
                placeholder="Geminiにメッセージを送る..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm md:text-base"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md shadow-indigo-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Guide Sidebar */}
        {showGuide && (
          <div className="absolute inset-0 md:relative md:w-[400px] bg-white border-l z-20 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">デプロイ完全ガイド</h2>
                <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-gray-600 md:hidden">閉じる</button>
              </div>

              <div className="space-y-8">
                <Step 
                  icon={<ShieldCheck className="text-green-500" />}
                  title="1. APIキーの取得"
                  desc="Google AI Studioで'Create API key'をクリック。これがAIの脳を使うための鍵になります。"
                  link="https://aistudio.google.com/"
                />
                <Step 
                  icon={<Github className="text-gray-900" />}
                  title="2. GitHubにアップロード"
                  desc="GitHubで新しいリポジトリ(PublicでOK)を作り、現在のファイルをすべてアップロードしてください。"
                  link="https://github.com/new"
                />
                <Step 
                  icon={<CloudLightning className="text-blue-500" />}
                  title="3. Vercelで公開"
                  desc="VercelにGitHubアカウントでログインし、先ほどのリポジトリをImportします。"
                  link="https://vercel.com/new"
                />
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-sm">
                    <Terminal className="w-4 h-4" /> 
                    最重要：環境変数の設定
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Vercelのプロジェクト設定（Settings > Environment Variables）で、Nameに <code className="bg-amber-100 px-1 rounded font-mono">API_KEY</code> 、Valueに <b>取得したGeminiのキー</b> を入力して保存してください。
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-xs text-gray-400 text-center italic">これですべて無料・広告なしで自分専用のAIチャットが動き始めます！</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Step = ({ icon, title, desc, link }: { icon: any, title: string, desc: string, link: string }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-2">{desc}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
        サイトを開く <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </div>
);

export default App;
