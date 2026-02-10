
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
  Info,
  ChevronRight,
  Settings,
  Lock
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
      content: 'こんにちは！ボットのコードは完成しています。\n\nあとはVercelの設定画面で「API_KEY」を登録するだけです。手順がわからない場合は、右上の「デプロイ手順」を開いてステップ4を確認してください！',
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
        content: 'エラー：APIキーが未設定か、通信に失敗しました。VercelのSettingsで API_KEY を設定し、再デプロイしてください。',
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
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Serverless Python</span>
          </div>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${showGuide ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
        >
          <Info className="w-4 h-4" />
          デプロイ手順
        </button>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
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
                <div className="bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 bg-white border-t">
            <div className="max-w-4xl mx-auto relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="AIに質問してみる..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-5 pr-16 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm md:text-base"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-lg shadow-indigo-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Improved Guide Sidebar */}
        {showGuide && (
          <div className="absolute inset-0 md:relative md:w-[450px] bg-white border-l z-40 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">デプロイ手順</h2>
                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-10">
                <Step 
                  number="1"
                  icon={<ShieldCheck className="text-emerald-500 w-6 h-6" />}
                  title="Gemini APIキーを取得"
                  desc="Google AI Studioにログインし、'Create API key'を押してキーをコピーしておきます。"
                  link="https://aistudio.google.com/"
                />
                
                <Step 
                  number="2"
                  icon={<Github className="text-gray-900 w-6 h-6" />}
                  title="GitHubへ保存"
                  desc="GitHubで新しいRepositoryを作成し、このコード一式をアップロード（Push）します。"
                  link="https://github.com/new"
                />

                <Step 
                  number="3"
                  icon={<CloudLightning className="text-blue-500 w-6 h-6" />}
                  title="Vercelで公開"
                  desc="VercelにGitHub連携でログインし、作成したリポジトリをImportしてDeployボタンを押します。"
                  link="https://vercel.com/new"
                />

                <div className="relative pl-12 border-l-2 border-indigo-100 pb-2">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">
                    4
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3 text-indigo-900 font-black text-base">
                      <Settings className="w-5 h-5 animate-spin-slow" /> 
                      Vercelでの設定方法（重要）
                    </div>
                    <ol className="text-sm text-indigo-800 space-y-3 leading-relaxed">
                      <li className="flex gap-2">
                        <span className="font-bold">①</span> 
                        Vercelのプロジェクト画面上部の <span className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-bold">Settings</span> タブを開く
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">②</span> 
                        左メニューの <span className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-bold">Environment Variables</span> をクリック
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">③</span> 
                        以下の通り入力して <span className="text-indigo-600 font-bold">Add</span> を押す
                      </li>
                    </ol>
                    
                    <div className="mt-4 space-y-2 bg-white p-3 rounded-xl border border-indigo-100 font-mono text-xs">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-gray-400">Key (Name)</span>
                        <span className="font-bold text-indigo-600">API_KEY</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-400">Value</span>
                        <span className="text-gray-600">コピーしたAIキーを貼付</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-[11px] text-indigo-500 bg-white/50 p-2 rounded-lg">
                      <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      最後に「Deployments」タブから最新のビルドの横にある「...」を押し、「Redeploy」すると設定が反映されます。
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-xs text-gray-400">困ったらChatGPTやGeminiに「VercelのEnvironment Variablesの設定方法を教えて」と聞くのもおすすめです！</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Step = ({ number, icon, title, desc, link }: { number: string, icon: any, title: string, desc: string, link: string }) => (
  <div className="relative pl-12 border-l-2 border-gray-100">
    <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-black text-gray-900 text-base">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-3">{desc}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors">
        {title} サイトへ <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </div>
);

export default App;
