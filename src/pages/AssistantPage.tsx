import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Lightbulb, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { answerQuestion, suggestedQuestions, type AIResponse } from '@/lib/ai';

interface AssistantPageProps {
  data: BusinessData;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  response?: AIResponse;
}

export function AssistantPage({ data }: AssistantPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleAsk = (question: string) => {
    if (!question.trim() || thinking) return;
    const userMsg: Message = { role: 'user', text: question };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);

    // Simulate brief thinking delay for UX
    setTimeout(() => {
      const response = answerQuestion(question, data);
      const aiMsg: Message = { role: 'ai', text: response.answer, response };
      setMessages((m) => [...m, aiMsg]);
      setThinking(false);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto pb-20 md:pb-8 flex flex-col" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-500/10 rounded-xl">
          <MessageSquare className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">CORA Assistant</h1>
          <p className="text-sm text-slate-400">Ask anything about your business</p>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-4 mb-4 min-h-[300px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-cyan-500/10 rounded-2xl mb-4 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Ask CORA about your business</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">I analyze your data in real time and give you clear, actionable answers.</p>

            {/* Suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
              {suggestedQuestions.slice(0, 6).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(q)}
                  className="text-left p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-300 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'user' ? (
              <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-sm">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[90%] w-full">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs font-medium text-cyan-400">CORA AI</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl rounded-tl-md p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Answer</span>
                    </div>
                    <p className="text-sm text-white whitespace-pre-line leading-relaxed">{msg.response!.answer}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">Why</span>
                    </div>
                    <p className="text-xs text-slate-400">{msg.response!.why}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Evidence</span>
                    </div>
                    <p className="text-xs text-slate-500">{msg.response!.evidence}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Action</span>
                    </div>
                    <p className="text-sm text-white font-medium">{msg.response!.action}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 sticky bottom-16 md:bottom-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
          placeholder="Ask CORA about your business..."
          className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={() => handleAsk(input)}
          disabled={!input.trim() || thinking}
          className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
