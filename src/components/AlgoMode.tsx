import React, { useState, useEffect } from 'react';
import { generateSimulation, PYTHON_CODE, SAMPLE_DATA, K } from '../lib/algorithm';
import type { SimulationStep } from '../lib/algorithm';
import { HeapViz } from './HeapViz';
import { StockChart } from './StockChart';
import { CodeViewer } from './CodeViewer';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';
import clsx from 'clsx';

export const AlgoMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  useEffect(() => {
    const s = generateSimulation(SAMPLE_DATA, K);
    setSteps(s);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  // Collect all medians from MEDIAN steps
  const allMedians = steps
    .filter(s => s.type === 'MEDIAN' && s.median !== null)
    .map(s => s.median as number);

  // Calculate the median of all medians (the "super-median")
  const medianOfMedians = (() => {
    if (allMedians.length === 0) return null;
    const sorted = [...allMedians].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  })();

  if (!currentStep) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  return (
    <div className="h-screen bg-slate-950 text-slate-100 p-4 font-sans flex flex-col overflow-hidden">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {t('algo.title')}
            </h1>
            <p className="text-xs text-slate-400">{t('algo.subtitle')}</p>
          </div>
        </div>
        <LanguageSelector />
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column: Chart, Controls, Heaps (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2">
          
          {/* Chart */}
          <div className="shrink-0">
            <StockChart 
              data={SAMPLE_DATA} 
              windowIndices={currentStep.windowIndices} 
              median={currentStep.median} 
            />
          </div>

          {/* Controls & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                    disabled={currentStepIndex === 0}
                  >
                    <SkipBack size={20} />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={clsx(
                      "p-1.5 rounded-lg transition-colors flex items-center gap-1 px-3 font-bold text-sm",
                      isPlaying ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    )}
                  >
                    {isPlaying ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Play</>}
                  </button>
                  <button 
                    onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                    disabled={currentStepIndex === steps.length - 1}
                  >
                    <SkipForward size={20} />
                  </button>
                  <button 
                    onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors ml-2"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 flex justify-between">
                <span>{t('algo.step')} {currentStepIndex + 1} / {steps.length}</span>
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-slate-900 border-none text-xs text-slate-400 focus:ring-0 py-0"
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={100}>5x</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
               <div className="text-sm text-slate-400 mb-1">{t('algo.currentAction')}</div>
               <div className="text-lg font-medium text-blue-200 leading-tight">
                  {currentStep.description}
               </div>
               {isLastStep && allMedians.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-slate-700">
                   <div className="text-sm text-emerald-400 font-bold mb-2">{t('algo.completed')}</div>
                   
                   {/* Final median - median of all medians */}
                   <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                     <div className="text-xs text-slate-400 mb-1">{t('algo.finalMedian')}</div>
                     <div className="text-3xl font-bold text-emerald-400 font-mono">
                       {medianOfMedians}
                     </div>
                   </div>
                   
                   {/* All medians */}
                   <div className="text-xs text-slate-400 mb-1">{t('algo.allMedians')}:</div>
                   <div className="flex flex-wrap gap-2">
                     {allMedians.map((m, i) => (
                       <span 
                         key={i} 
                         className={clsx(
                           "px-2 py-1 rounded text-sm font-mono",
                           i === allMedians.length - 1 
                             ? "bg-emerald-500/30 text-emerald-200 ring-2 ring-emerald-400" 
                             : "bg-emerald-500/20 text-emerald-300"
                         )}
                       >
                         {m}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* Heaps */}
          <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700 min-h-[250px]">
            <h2 className="text-sm font-bold mb-4 text-slate-300 uppercase tracking-wider">{t('algo.heapState')}</h2>
            <div className="grid grid-cols-2 gap-8 h-full">
              <HeapViz 
                title={t('algo.leftHeap')} 
                data={currentStep.smallHeap} 
                isMax={true} 
                delayed={currentStep.delayed}
                highlight={currentStep.highlightHeaps?.includes('small')}
              />
              <HeapViz 
                title={t('algo.rightHeap')} 
                data={currentStep.largeHeap} 
                isMax={false} 
                delayed={currentStep.delayed}
                highlight={currentStep.highlightHeaps?.includes('large')}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Code (5 cols) */}
        <div className="lg:col-span-5 h-full min-h-0">
          <CodeViewer 
            code={PYTHON_CODE} 
            activeLines={currentStep.codeLines || []} 
          />
        </div>

      </div>
    </div>
  );
};
