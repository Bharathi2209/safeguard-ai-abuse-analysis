
import React, { useState } from 'react';
import { 
  Shield, Upload, X, Trash2, Loader2, Sparkles, 
  FileJson, FileText, Globe, Info, Terminal, BrainCircuit
} from 'lucide-react';
import { analyzeContent } from './services/geminiService';
import { AnalysisResult } from './types';
import AnalysisChart from './components/AnalysisChart';
import StatusBadge from './components/StatusBadge';

const App: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!textInput.trim() && !imagePreview) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeContent({
        text: textInput || undefined,
        image: imagePreview || undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Linguistic analysis failed. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = (type: 'json' | 'text') => {
    if (!result) return;
    const content = type === 'json' 
      ? JSON.stringify(result, null, 2) 
      : `SAFEGUARD AI MODERATION REPORT\n============================\nVERDICT: ${result.recommendation}\nSEVERITY: ${result.overallScore}\nLANGUAGE: ${result.detectedLanguage}\nREASONING: ${result.reasoning}\nFLAGGED PHRASES: ${result.flaggedPhrases.join(', ')}`;
    
    const blob = new Blob([content], { type: type === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guard-report-${Date.now()}.${type}`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-900 rounded-2xl shadow-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">SafeGuard AI</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Automated Content Governance</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {setTextInput(''); setImagePreview(null); setResult(null); setError(null);}} 
            className="p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-500 rounded-xl transition-all"
            title="Clear workspace"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Input Processor
              </h2>
            </div>
            
            <textarea
              className="w-full h-56 p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-slate-900/5 transition-all outline-none text-slate-700 leading-relaxed text-sm placeholder:text-slate-300"
              placeholder="Paste content for analysis (social posts, messages, etc.)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-white hover:border-slate-900/20 transition-all cursor-pointer group">
                <Upload className="w-6 h-6 text-slate-300 group-hover:text-slate-900 mb-3 transition-colors" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Attach Visual Evidence</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative rounded-3xl overflow-hidden group shadow-lg border border-slate-100">
                <img src={imagePreview} className="w-full h-48 object-cover" alt="Upload Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setImagePreview(null)} className="p-3 bg-white text-rose-500 rounded-2xl hover:scale-110 transition-transform">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              disabled={isAnalyzing || (!textInput && !imagePreview)}
              onClick={runAnalysis}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
            >
              {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
              {isAnalyzing ? 'Processing Nuance...' : 'Initiate Safety Scan'}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-7">
          {!result && !isAnalyzing ? (
            <div className="h-full min-h-[600px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-40">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 tracking-tight uppercase">Ready for Analysis</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-3 font-bold leading-relaxed tracking-wide">
                SafeGuard AI is on standby. Submit text or imagery to perform a deep-level safety audit.
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-slate-900 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Decoding Intent...</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Running Global Moderation Logic</p>
              </div>
            </div>
          ) : result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row items-center gap-10 mb-10 pb-10 border-b border-slate-50">
                  <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="88" cy="88" r="76" stroke="#F1F5F9" strokeWidth="16" fill="none" />
                      <circle 
                        cx="88" cy="88" r="76" stroke={result.overallScore > 0.6 ? '#f43f5e' : result.overallScore > 0.3 ? '#fbbf24' : '#10b981'} 
                        strokeWidth="16" fill="none" strokeLinecap="round"
                        strokeDasharray={477} strokeDashoffset={477 * (1 - result.overallScore)}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-900">{(result.overallScore * 100).toFixed(0)}%</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity</span>
                    </div>
                  </div>
                  
                  <div className="text-center lg:text-left space-y-5">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <StatusBadge status={result.recommendation} />
                      <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200">
                        <Globe className="w-3.5 h-3.5" /> {result.detectedLanguage}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">
                      "{result.reasoning}"
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => exportReport('json')} 
                    className="flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    <FileJson className="w-4 h-4" /> JSON Dataset
                  </button>
                  <button 
                    onClick={() => exportReport('text')} 
                    className="flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    <FileText className="w-4 h-4" /> Summary Report
                  </button>
                </div>
              </div>

              <AnalysisChart metrics={result.metrics} />

              {result.flaggedPhrases.length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Identified Violation Tokens</h4>
                  <div className="flex flex-wrap gap-3">
                    {result.flaggedPhrases.map((token, i) => (
                      <span key={i} className="px-4 py-2 bg-rose-50 text-rose-600 text-[11px] font-black rounded-xl border border-rose-100 shadow-sm animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      
      <footer className="mt-auto py-10 text-center border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Built by Bharathi &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Engine v2.4.0</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
