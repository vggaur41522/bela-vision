'use client';

import React, { useState, useEffect } from 'react';
import { calculateNumerology, NumerologyCalculation, Gender } from '@/lib/numerology';
import { LoShuGrid } from '@/components/LoShuGrid';
import { AdjustmentSimulator } from '@/components/AdjustmentSimulator';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { Save, History, ChevronRight, CheckCircle2, Play, Trash2 } from 'lucide-react';

type ProfileInput = {
  name: string;
  dob: string;
  gender: Gender;
};

type AnalysisResult = {
  id: string;
  dateStr: string;
  mode: 'individual' | 'couple';
  profiles: {
    input: ProfileInput;
    calc: NumerologyCalculation;
  }[];
  markdownContent: string;
};

export default function Home() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [mode, setMode] = useState<'individual' | 'couple'>('individual');
  const [p1, setP1] = useState<ProfileInput>({ name: '', dob: '', gender: 'male' });
  const [p2, setP2] = useState<ProfileInput>({ name: '', dob: '', gender: 'female' });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedHistory, setSavedHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileFormVisible, setMobileFormVisible] = useState(true);

  // Load history from local storage on mount
  useEffect(() => {
    const hist = localStorage.getItem('belavision_history');
    if (hist) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedHistory(JSON.parse(hist));
      } catch (e) {
        // syntax error
      }
    }
  }, []);

  const saveToHistory = () => {
    if (!result) return;
    const newHist = [result, ...savedHistory.filter(h => h.id !== result.id)];
    setSavedHistory(newHist);
    localStorage.setItem('belavision_history', JSON.stringify(newHist));
    setToastMessage('Report saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHist = savedHistory.filter(h => h.id !== id);
    setSavedHistory(newHist);
    localStorage.setItem('belavision_history', JSON.stringify(newHist));
  };

  const calculateAndFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const calc1 = calculateNumerology(p1.name, p1.dob, p1.gender);
    const calc2 = mode === 'couple' ? calculateNumerology(p2.name, p2.dob, p2.gender) : null;
    
    const profiles = [{ ...p1, calc: calc1 }];
    if (mode === 'couple' && calc2) {
      profiles.push({ ...p2, calc: calc2 });
    }

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          profiles
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
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setResult({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        dateStr: new Date().toLocaleDateString(),
        mode,
        profiles: profiles.map(p => ({
          input: { name: p.name, dob: p.dob, gender: p.gender },
          calc: p.calc
        })),
        markdownContent: data.result,
      });
      setMobileFormVisible(false);

    } catch (err) {
      console.error(err);
      alert('Failed to generate analysis.');
    } finally {
      setLoading(false);
    }
  };

  const loadPastResult = (res: AnalysisResult) => {
    setResult(res);
    setMode(res.mode);
    setP1(res.profiles[0].input);
    if (res.profiles[1]) {
      setP2(res.profiles[1].input);
    }
    setShowHistory(false);
    setView('app');
    setMobileFormVisible(false);
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/10 blur-[150px] rounded-full mix-blend-screen" />
        </div>

        <div className="z-10 flex flex-col items-center max-w-4xl w-full px-6 py-12 md:py-24">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-indigo-500/30 mb-8 shadow-2xl shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full relative bg-slate-800 flex items-center justify-center overflow-hidden">
               <img src="/icon.jpg" alt="BELAvision Icon" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('after:content-[\'Upload_icon.jpg\']', 'after:text-[10px]', 'after:text-slate-500'); }} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-100 mb-4 text-center drop-shadow-lg">
            BELAvision
          </h1>
          <p className="text-lg md:text-xl text-indigo-300 font-medium mb-10 text-center max-w-2xl px-4 drop-shadow-md">
            ब्रह्मांडीय ऊर्जा से जुडें और अपने जीवन की गहरी अंकशास्त्र संबंधी अंतर्दृष्टि खोजें। (Connect to cosmic energy and discover deep numerological insights about your life.)
          </p>
          
          <button 
            onClick={() => setView('app')}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg md:text-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(79,70,229,0.4)]"
          >
            शुरू करें (Start)
            <Play className="fill-current w-5 h-5 ml-1" />
          </button>

          {/* Saved Reports Section */}
          {savedHistory.length > 0 && (
            <div className="mt-20 w-full max-w-3xl animate-[fadeIn_0.5s_ease-out_forwards]">
               <h3 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
                 सहेजी गई रिपोर्ट (Saved Reports)
               </h3>
               <div className="grid gap-4 md:grid-cols-2">
                 {savedHistory.slice(0, 4).map(hist => (
                   <div key={hist.id} onClick={() => loadPastResult(hist)} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group flex flex-col relative">
                     <div className="flex justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider mb-3">
                       <span>{hist.mode === 'individual' ? 'व्यक्तिगत' : 'युगल'}</span>
                       <span>{hist.dateStr}</span>
                     </div>
                     <div className="font-semibold text-slate-100 text-lg flex items-center justify-between mb-1">
                       <span className="truncate pr-8">{hist.profiles[0].input.name} {hist.mode === 'couple' && `& ${hist.profiles[1].input.name}`}</span>
                     </div>
                     <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                       <button onClick={(e) => deleteHistory(hist.id, e)} className="p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-slate-800" title="Delete">
                          <Trash2 size={16} />
                       </button>
                       <div className="p-2 bg-indigo-600/20 text-indigo-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity md:ml-2">
                         <ChevronRight size={16} />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               {savedHistory.length > 4 && (
                 <button onClick={() => { setView('app'); setShowHistory(true); }} className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 font-medium px-4 py-2 bg-slate-900 rounded-lg">
                   सभी सहेजी गई रिपोर्ट देखें ({savedHistory.length})
                 </button>
               )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-slate-800 shrink-0 border border-indigo-500/30">
            <img src="/icon.jpg" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/belavision/100/100'; }} />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase hidden sm:block">BELAvision</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowHistory(!showHistory)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700 font-medium whitespace-nowrap">
            Saved Reports
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-4 p-0 md:p-4 relative">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-20 right-4 md:right-8 z-50 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out_forwards]">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Sidebar - Setup */}
        <div className={cn("col-span-1 md:col-span-3 bg-slate-900 md:rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto z-10 transition-transform", showHistory ? "hidden md:flex" : (mobileFormVisible ? "flex" : "hidden md:flex"))}>
          <form onSubmit={calculateAndFetch} className="flex-1 flex flex-col">
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">विश्लेषण मोड (Analysis Mode)</label>
              <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  className={cn("py-2 text-xs font-semibold rounded-lg transition-colors", mode === 'individual' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-100")}
                  onClick={() => setMode('individual')}
                >
                  व्यक्तिगत (Individual)
                </button>
                <button
                  type="button"
                  className={cn("py-2 text-xs font-semibold rounded-lg transition-colors", mode === 'couple' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-100")}
                  onClick={() => setMode('couple')}
                >
                  युगल (Couple)
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <ProfileForm profile={p1} setProfile={setP1} label={mode === 'couple' ? "पहला व्यक्ति (Person 1)" : "आपका विवरण (Your Details)"} />
              
              {mode === 'couple' && (
                <ProfileForm profile={p2} setProfile={setP2} label="दूसरा व्यक्ति (Person 2)" />
              )}
            </div>

            <div className="mt-8 mb-6 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl">
              <p className="text-xs text-indigo-300 leading-relaxed italic">
                &quot;अंकशास्त्र (Numerology) ब्रह्मांडीय स्पंदनों (cosmic impulses) को निर्दिष्ट करने वाले अंकों का अध्ययन है।&quot;
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !p1.name || !p1.dob || (mode === 'couple' && (!p2.name || !p2.dob))}
              className="w-full mt-auto bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors shrink-0"
            >
              {loading ? 'पैटर्न का विश्लेषण कर रहे हैं...' : 'नया विश्लेषण (New Analysis)'}
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-9 overflow-y-auto relative flex flex-col bg-slate-950 md:bg-transparent pb-16 md:pb-0">
          
          {!mobileFormVisible && (
            <div className="md:hidden p-4 pb-0 space-y-4">
              <button 
                onClick={() => setMobileFormVisible(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                title="Edit Details"
              >
                ← विवरण संपादित करें (Edit Details)
              </button>
            </div>
          )}

          {/* Saved History Overlay */}
          {showHistory && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-20 overflow-y-auto p-4 md:p-8 flex flex-col md:rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-6 mt-2 md:mt-0">
                <h2 className="text-xl md:text-2xl tracking-tight font-display font-medium text-slate-100">सहेजे गए इतिहास (Saved Histories)</h2>
                <button type="button" onClick={() => setShowHistory(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700">बंद करें</button>
              </div>
              {savedHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">अभी तक कोई प्रोफ़ाइल सहेजी नहीं गई है। (No saved profiles yet.)</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {savedHistory.map(hist => (
                    <div key={hist.id} onClick={() => loadPastResult(hist)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-slate-600 hover:shadow-sm transition-all group relative">
                      <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                       <span>{hist.mode === 'individual' ? 'व्यक्तिगत' : 'युगल'}</span>
                       <span>{hist.dateStr}</span>
                      </div>
                      <div className="font-medium text-slate-200 mb-1 flex items-center justify-between pr-8">
                        <span className="truncate">{hist.profiles[0].input.name} {hist.mode === 'couple' && `& ${hist.profiles[1].input.name}`}</span>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2">
                        <button onClick={(e) => deleteHistory(hist.id, e)} className="p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-slate-800" title="Delete">
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-6 md:border border-slate-800 md:rounded-2xl md:bg-slate-900">
              <div className="grid grid-cols-3 gap-2 w-32 mb-6">
                {[4,9,2,3,5,7,8,1,6].map(n => (
                  <div key={n} className="w-10 h-10 border border-slate-700 rounded-md flex items-center justify-center font-display text-slate-500 font-bold bg-slate-950">{n}</div>
                ))}
              </div>
              <h2 className="font-bold tracking-tight text-2xl mb-2 text-slate-300">Connect to the Cosmic Blueprint</h2>
              <p className="max-w-md text-sm text-slate-400">Enter your details to generate your Lo Shu Grid and discover deep numerological insights about your life path, challenges, and remedies.</p>
            </div>
          )}

          {loading && (
             <div className="h-full flex flex-col items-center justify-center animate-pulse p-6 md:border border-slate-800 md:rounded-2xl md:bg-slate-900">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-semibold tracking-wide uppercase text-sm">Decoding numerology patterns...</p>
             </div>
          )}

          {result && !loading && (
             <div className="grid grid-cols-1 lg:grid-cols-3 auto-rows-min gap-4 pb-12 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] md:pr-2">
               {result.profiles.map((p, i) => (
                 <React.Fragment key={i}>
                   {/* Core Numbers Card */}
                   <div className="col-span-1 lg:col-span-2 bg-slate-900 md:rounded-2xl border-y md:border border-slate-800 p-5 flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{p.input.name} <span className="opacity-50 mx-2">|</span> Vibrational Metrics</h3>
                        <span className="text-xs font-bold text-slate-600">{p.input.dob}</span>
                     </div>
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-indigo-400">{p.calc.driverNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase mt-1 font-bold">Driver (Date)</span>
                        </div>
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-emerald-400">{p.calc.conductorNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase mt-1 font-bold">Conductor (Full)</span>
                        </div>
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-amber-400">{p.calc.kuaNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase mt-1 font-bold">Kua Number</span>
                        </div>
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-rose-400">{p.calc.nameNumber}</span>
                          <span className="text-[10px] text-slate-500 uppercase mt-1 font-bold">Name Number</span>
                        </div>
                     </div>
                   </div>

                   {/* Lo Shu Grid Card */}
                   <div className="col-span-1 lg:col-span-1 bg-slate-900 md:rounded-2xl border-y md:border border-indigo-500/30 p-5 flex flex-col shadow-lg shadow-indigo-950/20">
                     <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Lo Shu Grid</h3>
                     <LoShuGrid counts={p.calc.counts} className="mb-4 max-w-full lg:max-w-xs" />
                     <p className="mt-2 text-[11px] text-slate-400 text-center uppercase tracking-tighter">Ancient Saturn Square</p>
                     <AdjustmentSimulator
                        originalName={p.input.name}
                        dob={p.input.dob}
                        gender={p.input.gender}
                        originalCalc={p.calc}
                     />
                   </div>
                 </React.Fragment>
               ))}

               {/* Markdown content */}
               <div className="col-span-1 lg:col-span-3 bg-slate-900 md:rounded-2xl border-y md:border border-slate-800 p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">AI Pattern Analysis & Remedies</h3>
                     <button onClick={saveToHistory} className="w-full sm:w-auto px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center shrink-0">
                        <Save size={14} className="mr-2 hidden sm:block" />
                        Save Result
                     </button>
                  </div>
                  <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-slate-200 prose-li:text-slate-200 prose-strong:text-indigo-300 prose-a:text-indigo-400 text-lg sm:text-xl">
                     <ReactMarkdown>{result.markdownContent}</ReactMarkdown>
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ profile, setProfile, label }: { profile: ProfileInput, setProfile: (p: ProfileInput) => void, label: string }) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length >= 3) val = val.slice(0, 2) + '-' + val.slice(2);
    if (val.length >= 6) val = val.slice(0, 5) + '-' + val.slice(5);
    setProfile({...profile, dob: val});
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</h3>
      
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
        <input 
          type="text" 
          value={profile.name}
          onChange={e => setProfile({...profile, name: e.target.value})}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
          placeholder="e.g. John Doe"
          required
        />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth (DD-MM-YYYY)</label>
          <input 
            type="text" 
            value={profile.dob}
            onChange={handleDateChange}
            placeholder="DD-MM-YYYY"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
            required
            pattern="\d{2}-\d{2}-\d{4}"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
          <select 
            value={profile.gender}
            onChange={e => setProfile({...profile, gender: e.target.value as Gender})}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 transition-colors"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
    </div>
  );
}
