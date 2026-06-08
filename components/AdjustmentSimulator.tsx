'use client';

import React, { useState } from 'react';
import { calculateNumerology, NumerologyCalculation, Gender } from '@/lib/numerology';
import { LoShuGrid } from '@/components/LoShuGrid';
import ReactMarkdown from 'react-markdown';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AdjustmentSimulatorProps {
  originalName: string;
  dob: string;
  gender: Gender;
  originalCalc: NumerologyCalculation;
}

export function AdjustmentSimulator({ originalName, dob, gender, originalCalc }: AdjustmentSimulatorProps) {
  const [newName, setNewName] = useState('');
  const [simulatedCalc, setSimulatedCalc] = useState<NumerologyCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!newName) return;
    
    setLoading(true);
    const newCalc = calculateNumerology(newName, dob, gender);
    setSimulatedCalc(newCalc);

    try {
      const resp = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalName,
          newName,
          originalCounts: originalCalc.counts,
          newCounts: newCalc.counts
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        let errorMessage = "An error occurred";
        try {
          const json = JSON.parse(text);
          errorMessage = json.error || text;
        } catch(e) {
          errorMessage = text || resp.statusText;
        }
        alert(errorMessage);
        return;
      }

      const data = await resp.json();
      if (data.result) {
        setSummary(data.result);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-800">
      <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
        <Sparkles size={16} className="mr-2" />
        जीवन पथ समायोजन (Life Path Adjustment)
      </h4>
      <p className="text-xs text-slate-400 mb-4">
        अपने लो शू अंकों पर पड़ने वाले प्रभाव को देखने के लिए नाम बदलने (जैसे, स्वर जोड़ना या हटाना) का अनुकरण करें। (Simulate a name change to see how it affects your Lo Shu numbers.)
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input 
          type="text" 
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="नई स्पेलिंग दर्ज करें (Enter new spelling)..."
          className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
        />
        <button 
          onClick={handleSimulate}
          disabled={loading || !newName}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 sm:whitespace-nowrap"
        >
          {loading ? 'अनुकरण कर रहे हैं...' : 'अनुकरण करें (Simulate)'}
        </button>
      </div>

      {simulatedCalc && (
        <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 animate-[fadeIn_0.3s_ease-out_forwards] overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
            <span className="text-sm font-bold text-slate-300 break-all">{newName}</span>
            <span className="text-xs text-slate-500 font-bold uppercase bg-slate-900 border border-slate-800 px-2 py-1 rounded inline-block">नामांक (Name No): {simulatedCalc.nameNumber}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
            <div className="opacity-50 scale-[0.65] md:scale-75 transform md:origin-right origin-center">
              <LoShuGrid counts={originalCalc.counts} className="max-w-[200px]" />
            </div>
            <ArrowRight size={24} className="text-indigo-500/50 rotate-90 md:rotate-0" />
            <div className="scale-[0.8] md:scale-90 transform md:origin-left origin-center">
              <LoShuGrid counts={simulatedCalc.counts} className="max-w-[200px]" />
            </div>
          </div>

          {summary && (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-p:leading-relaxed prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-indigo-300">
               <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
