import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Cpu, LineChart, MessageSquare, Send, Loader2 } from 'lucide-react';

import { MarketData } from '../types';

interface AIAnalystProps {
  marketData: MarketData[];
}

export default function AIAnalyst({ marketData }: AIAnalystProps) {
  const [prompt, setPrompt] = React.useState('');
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setAnalysis(null);
    
    const marketContext = marketData.map(m => `${m.symbol}: $${m.price} (${m.change24h}%)`).join(', ');
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Market Context: ${marketContext}. As a professional market analyst, analyze the following query and provide actionable insights for an investor: ${prompt}. Keep it professional, data-driven, and concise.` 
        }),
      });
      const data = await response.json();
      setAnalysis(data.text);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysis('Failed to connect to the AI brain. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-black rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight">AI Market Intelligence</h2>
        </div>
        <p className="text-[#6B6B6B] text-lg">
          Ask our neural engine for market sentiment, technical analysis, or investment strategies.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Terminal/Input Side */}
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-[#151619] rounded-[32px] p-8 border border-[#2D2E32] shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-[#2D2E32] pb-6">
              <Terminal className="w-5 h-5 text-zinc-500" />
              <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Neural_Input_v1.0</span>
            </div>

            <div className="space-y-4">
               <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Analyze the current crypto market trend and suggest a risk-managed entry for BTC..."
                className="w-full bg-transparent border-none text-[#FFFFFF] font-mono text-lg resize-none outline-none min-h-[120px] placeholder:text-zinc-700"
               />
               
               <div className="flex justify-between items-center pt-4">
                  <div className="flex gap-4 text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Model: Gemini 1.5</span>
                    <span className="flex items-center gap-1"><LineChart className="w-3 h-3" /> Data: Real-time</span>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isLoading || !prompt}
                    className="group bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-xl shadow-white/5"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    Ignite Analysis
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Output Side */}
        <AnimatePresence mode="wait">
          {(isLoading || analysis) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="lg:col-span-12"
            >
              <div className="bg-white rounded-[32px] p-10 border border-[#E5E5E5] min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
                {!analysis && isLoading && (
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-zinc-100 rounded-full" />
                      <div className="w-24 h-24 border-4 border-t-black rounded-full animate-spin absolute inset-0" />
                      <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Quantifying Market Data...</h4>
                      <p className="text-[#6B6B6B]">The neural engine is synthesizing your request.</p>
                    </div>
                  </div>
                )}
                
                {analysis && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-2 px-4 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          <MessageSquare className="w-3 h-3" /> Intelligence Output
                       </div>
                       <button onClick={() => setAnalysis(null)} className="text-xs font-bold text-[#6B6B6B] hover:text-black">Clear Result</button>
                    </div>
                    <div className="prose prose-zinc max-w-none">
                       <p className="text-[#1A1A1A] leading-relaxed whitespace-pre-wrap font-medium">
                        {analysis}
                       </p>
                    </div>
                  </div>
                )}

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5F4] rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F5F5F4] rounded-full -ml-16 -mb-16" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
