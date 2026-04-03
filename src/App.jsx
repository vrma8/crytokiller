import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Zap, Search, Hash, Key, Info, RefreshCw, Copy, Check } from 'lucide-react';
import * as solvers from './utils/cryptoSolvers';

const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const columns = Math.floor(width / 20);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 4, 8, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f0';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, opacity: 0.15 }} />;
};

function App() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('magic'); // magic, classical, symmetric, tools

  useEffect(() => {
    if (activeTab === 'magic') {
      setResults(solvers.autoDetect(input));
    }
  }, [input, activeTab]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCaesarBrute = () => {
    const bruteResults = solvers.bruteCaesar(input);
    setResults(bruteResults.map(r => ({ type: `Shift ${r.shift}`, result: r.result })));
  };

  const handleXorBrute = () => {
    const xorResults = solvers.bruteXOR(input);
    setResults(xorResults.map(r => ({ type: `Key ${r.key}`, result: r.result })));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="scanline" />
      <MatrixBackground />

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bc13fe] to-[#00f3ff] flex items-center justify-center shadow-lg shadow-[#bc13fe]/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
              <h1 className="text-2xl title-glow m-0 leading-tight">CryptoKiller</h1>
              <p className="text-[10px] text-[#00f3ff] font-mono tracking-widest uppercase opacity-60">Universal Solver Tool</p>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-4">
            <button className={`secondary py-2 text-sm ${activeTab === 'magic' ? 'bg-[#bc13fe]/20 border-[#bc13fe]/30' : ''}`} onClick={() => setActiveTab('magic')}>Magic</button>
            <button className={`secondary py-2 text-sm ${activeTab === 'classical' ? 'bg-[#bc13fe]/20 border-[#bc13fe]/30' : ''}`} onClick={() => setActiveTab('classical')}>Classical</button>
            <button className={`secondary py-2 text-sm ${activeTab === 'tools' ? 'bg-[#bc13fe]/20 border-[#bc13fe]/30' : ''}`} onClick={() => setActiveTab('tools')}>Analysis</button>
        </nav>

        <div className="flex gap-2">
           <button className="secondary p-2"><Search size={18}/></button>
           <button className="p-2 px-4 text-sm font-bold flex items-center gap-2">
            <Zap size={14} fill="currentColor" /> v1.0
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* Input Region */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-sm text-[#00f3ff] font-bold">
               <Terminal size={16} /> INPUT CIPHERTEXT / DATA
             </div>
             <button className="secondary p-1 text-[10px] uppercase font-bold tracking-wider" onClick={() => setInput('')}>Clear</button>
          </div>
          <textarea 
            className="w-full h-40 text-lg p-6 bg-black/40 border-white/5 rounded-2xl placeholder:opacity-20"
            placeholder="Paste hash, base64, hex, or cipher here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </motion.div>

        {/* Dynamic Actions per Tab */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {activeTab === 'classical' && (
                 <button onClick={handleXorBrute} className="w-full">XOR Brute (Hex)</button>
             )}
             {activeTab === 'classical' && (
                 <button onClick={() => setResults([{ type: 'Atbash', result: solvers.solveAtbash(input) }])} className="w-full">Solve Atbash</button>
             )}
        </div>

        {/* Results Region */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#94a3b8]">
                <Hash size={14} /> Solved Candidates
            </div>

            <AnimatePresence mode="popLayout">
                {results.length > 0 ? (
                  results.map((res, idx) => (
                    <motion.div 
                      key={`${res.type}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 hover:border-[#bc13fe]/30"
                    >
                      <div className="flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-[#bc13fe] uppercase tracking-wider">{res.type}</span>
                          <div className="font-mono text-sm break-all text-gray-200">
                             {res.result}
                          </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <button 
                            onClick={() => handleCopy(res.result)}
                            className="secondary p-2 group relative"
                         >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                         </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-30 italic text-sm">
                     Waiting for input...
                  </div>
                )}
            </AnimatePresence>
        </section>

      </main>

      {/* Quick Access Footer */}
      <footer className="p-4 text-center text-[#64748b] text-[10px] uppercase font-mono tracking-widest border-t border-white/5">
         &copy; 2024 CryptoKiller // Made by CTF Masters
      </footer>
    </div>
  );
}

export default App;
