import React, { useState, useMemo } from 'react';
import { HeapViz } from './HeapViz';
import { CodeViewer } from './CodeViewer';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';
import clsx from 'clsx';

// Better data where lazy deletion actually happens!
// Window 2: remove(40) but 40 is NOT at top of heap (50 is) -> LAZY DELETION!
const SIMPLE_DATA = [40, 50, 70, 30, 90, 20, 80];
const SIMPLE_K = 3;

// Celotna Python koda za prikaz
const SIMPLE_CODE = `from heapq import heappush, heappop

# Strukture
small = []   # Max-Heap (manjša polovica)
large = []   # Min-Heap (večja polovica)
lazy = {}    # Lazy deletion tabela
sz = [0, 0]  # Logične velikosti [small, large]

def add(x):
    if not small or x <= -small[0]:
        heappush(small, -x)  # Max-heap trik
        sz[0] += 1
    else:
        heappush(large, x)
        sz[1] += 1
    balance()

def remove(x):
    lazy[x] = lazy.get(x, 0) + 1  # Označi
    if x <= -small[0]:
        sz[0] -= 1
        if x == -small[0]:
            prune_small()  # Na vrhu -> odstrani
    else:
        sz[1] -= 1
        if large and x == large[0]:
            prune_large()
    balance()

def prune_small():
    while small and lazy.get(-small[0], 0):
        v = -heappop(small)
        lazy[v] -= 1
        if not lazy[v]: del lazy[v]

def prune_large():
    while large and lazy.get(large[0], 0):
        v = heappop(large)
        lazy[v] -= 1
        if not lazy[v]: del lazy[v]

def balance():
    # Invarianta: |small| ∈ {|large|, |large|+1}
    if sz[0] > sz[1] + 1:
        prune_small()
        heappush(large, -heappop(small))
        sz[0] -= 1; sz[1] += 1
    elif sz[0] < sz[1]:
        prune_large()
        heappush(small, -heappop(large))
        sz[1] -= 1; sz[0] += 1

def median():
    prune_small()
    prune_large()
    if k % 2 == 1:
        return -small[0]
    return (-small[0] + large[0]) / 2

# Glavna zanka
for i in range(k):
    add(nums[i])
result = [median()]

for i in range(k, len(nums)):
    add(nums[i])
    remove(nums[i - k])
    result.append(median())`;

type SimpleStep = {
  id: number;
  phase: 'init' | 'add' | 'balance' | 'median' | 'remove' | 'lazy';
  description: string;
  descriptionEn: string;
  descriptionDe: string;
  window: number[];
  windowStart: number;
  smallHeap: number[];
  largeHeap: number[];
  lazyTable: Record<number, number>;
  median: number | null;
  highlightElement?: number;
  highlightHeap?: 'small' | 'large' | 'both';
  codeLines: number[];
};

// Generate step-by-step simulation for simple example
function generateSimpleSteps(): SimpleStep[] {
  const steps: SimpleStep[] = [];
  let stepId = 0;
  
  const smallHeap: number[] = [];
  const largeHeap: number[] = [];
  const lazyTable: Record<number, number> = {};
  let sz = [0, 0];
  
  const heapifyUp = (arr: number[], idx: number, isMax: boolean) => {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      const shouldSwap = isMax ? arr[idx] > arr[parent] : arr[idx] < arr[parent];
      if (shouldSwap) {
        [arr[idx], arr[parent]] = [arr[parent], arr[idx]];
        idx = parent;
      } else break;
    }
  };
  
  const heapifyDown = (arr: number[], idx: number, isMax: boolean) => {
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let target = idx;
      
      if (left < arr.length) {
        const compare = isMax ? arr[left] > arr[target] : arr[left] < arr[target];
        if (compare) target = left;
      }
      if (right < arr.length) {
        const compare = isMax ? arr[right] > arr[target] : arr[right] < arr[target];
        if (compare) target = right;
      }
      
      if (target !== idx) {
        [arr[idx], arr[target]] = [arr[target], arr[idx]];
        idx = target;
      } else break;
    }
  };
  
  const pushHeap = (arr: number[], val: number, isMax: boolean) => {
    arr.push(val);
    heapifyUp(arr, arr.length - 1, isMax);
  };
  
  const popHeap = (arr: number[], isMax: boolean): number | undefined => {
    if (arr.length === 0) return undefined;
    const top = arr[0];
    const last = arr.pop()!;
    if (arr.length > 0) {
      arr[0] = last;
      heapifyDown(arr, 0, isMax);
    }
    return top;
  };
  
  let currentWindow: number[] = [];
  let currentWindowStart = 0;
  
  // Code line mapping for each phase (matches SIMPLE_CODE lines)
  // Line numbers in SIMPLE_CODE:
  // 1: from heapq...
  // 3-7: Strukture (small, large, lazy, sz)
  // 9-16: def add(x)
  // 18-28: def remove(x)
  // 30-34: def prune_small()
  // 36-40: def prune_large()
  // 42-50: def balance()
  // 52-57: def median()
  // 59-67: Glavna zanka
  const getCodeLines = (phase: SimpleStep['phase']): number[] => {
    switch (phase) {
      case 'init': return [3, 4, 5, 6, 7];
      case 'add': return [9, 10, 11, 12, 13, 14, 15, 16];
      case 'lazy': return [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
      case 'balance': return [42, 43, 44, 45, 46, 47, 48, 49, 50];
      case 'median': return [52, 53, 54, 55, 56, 57];
      default: return [];
    }
  };
  
  const snapshot = (
    phase: SimpleStep['phase'],
    description: string,
    descriptionEn: string,
    descriptionDe: string,
    highlightElement?: number,
    highlightHeap?: 'small' | 'large' | 'both',
    windowOverride?: number[],
    windowStartOverride?: number
  ): void => {
    const median = sz[0] > 0 ? (
      SIMPLE_K % 2 === 1 ? smallHeap[0] : (smallHeap[0] + largeHeap[0]) / 2
    ) : null;
    
    steps.push({
      id: stepId++,
      phase,
      description,
      descriptionEn,
      descriptionDe,
      window: windowOverride ?? [...currentWindow],
      windowStart: windowStartOverride ?? currentWindowStart,
      smallHeap: [...smallHeap],
      largeHeap: [...largeHeap],
      lazyTable: { ...lazyTable },
      median,
      highlightElement,
      highlightHeap,
      codeLines: getCodeLines(phase)
    });
  };
  
  // Step 0: Init
  snapshot('init', 
    `Začetek: Prazen small (Max-Heap) in large (Min-Heap). k = ${SIMPLE_K}`,
    `Start: Empty small (Max-Heap) and large (Min-Heap). k = ${SIMPLE_K}`,
    `Start: Leerer small (Max-Heap) und large (Min-Heap). k = ${SIMPLE_K}`,
    undefined, undefined, [], 0
  );
  
  // Build first window
  for (let i = 0; i < SIMPLE_K; i++) {
    const x = SIMPLE_DATA[i];
    currentWindow.push(x);
    
    // Decide which heap
    if (smallHeap.length === 0 || x <= smallHeap[0]) {
      pushHeap(smallHeap, x, true);
      sz[0]++;
      snapshot('add', 
        `Dodaj ${x} v Small (Max-Heap)`,
        `Add ${x} to Small (Max-Heap)`,
        `Füge ${x} zu Small (Max-Heap) hinzu`,
        x, 'small'
      );
    } else {
      pushHeap(largeHeap, x, false);
      sz[1]++;
      snapshot('add', 
        `Dodaj ${x} v Large (Min-Heap)`,
        `Add ${x} to Large (Min-Heap)`,
        `Füge ${x} zu Large (Min-Heap) hinzu`,
        x, 'large'
      );
    }
    
    // Balance if needed
    if (sz[0] > sz[1] + 1) {
      const val = popHeap(smallHeap, true)!;
      pushHeap(largeHeap, val, false);
      sz[0]--;
      sz[1]++;
      snapshot('balance', 
        `Uravnoteženje: Premik ${val} iz Small v Large`,
        `Balance: Move ${val} from Small to Large`,
        `Ausgleich: Verschiebe ${val} von Small nach Large`,
        val, 'both'
      );
    } else if (sz[0] < sz[1]) {
      const val = popHeap(largeHeap, false)!;
      pushHeap(smallHeap, val, true);
      sz[1]--;
      sz[0]++;
      snapshot('balance', 
        `Uravnoteženje: Premik ${val} iz Large v Small`,
        `Balance: Move ${val} from Large to Small`,
        `Ausgleich: Verschiebe ${val} von Large nach Small`,
        val, 'both'
      );
    }
  }
  
  // First median
  const m1 = SIMPLE_K % 2 === 1 ? smallHeap[0] : (smallHeap[0] + largeHeap[0]) / 2;
  snapshot('median', 
    `Mediana okna [${currentWindow.join(', ')}] = ${m1}`,
    `Median of window [${currentWindow.join(', ')}] = ${m1}`,
    `Median des Fensters [${currentWindow.join(', ')}] = ${m1}`,
    undefined, 'both'
  );
  
  // Slide window
  for (let i = SIMPLE_K; i < SIMPLE_DATA.length; i++) {
    const outElem = SIMPLE_DATA[i - SIMPLE_K];
    const inElem = SIMPLE_DATA[i];
    
    currentWindowStart++;
    currentWindow.shift();
    currentWindow.push(inElem);
    
    snapshot('init', 
      `Okno se premakne: -${outElem}, +${inElem}`,
      `Window slides: -${outElem}, +${inElem}`,
      `Fenster verschiebt sich: -${outElem}, +${inElem}`,
      inElem
    );
    
    // Add new element
    if (smallHeap.length === 0 || inElem <= smallHeap[0]) {
      pushHeap(smallHeap, inElem, true);
      sz[0]++;
      snapshot('add', 
        `Dodaj ${inElem} v Small`,
        `Add ${inElem} to Small`,
        `Füge ${inElem} zu Small hinzu`,
        inElem, 'small'
      );
    } else {
      pushHeap(largeHeap, inElem, false);
      sz[1]++;
      snapshot('add', 
        `Dodaj ${inElem} v Large`,
        `Add ${inElem} to Large`,
        `Füge ${inElem} zu Large hinzu`,
        inElem, 'large'
      );
    }
    
    // Lazy delete old element
    lazyTable[outElem] = (lazyTable[outElem] || 0) + 1;
    
    // Determine which heap it belongs to and decrement logical size
    if (outElem <= smallHeap[0]) {
      sz[0]--;
      snapshot('lazy', 
        `Lazy Delete: Označi ${outElem} za izbris (je v Small)`,
        `Lazy Delete: Mark ${outElem} for deletion (in Small)`,
        `Lazy Delete: Markiere ${outElem} zum Löschen (in Small)`,
        outElem, 'small'
      );
      
      // If it's on top, prune it
      if (outElem === smallHeap[0]) {
        while (smallHeap.length > 0 && lazyTable[smallHeap[0]] > 0) {
          const v = popHeap(smallHeap, true)!;
          lazyTable[v]--;
          if (lazyTable[v] === 0) delete lazyTable[v];
        }
        snapshot('lazy', 
          `Prune Small: Fizično odstrani ${outElem} z vrha`,
          `Prune Small: Physically remove ${outElem} from top`,
          `Prune Small: Physisch ${outElem} von der Spitze entfernen`,
          outElem, 'small'
        );
      }
    } else {
      sz[1]--;
      snapshot('lazy', 
        `Lazy Delete: Označi ${outElem} za izbris (je v Large)`,
        `Lazy Delete: Mark ${outElem} for deletion (in Large)`,
        `Lazy Delete: Markiere ${outElem} zum Löschen (in Large)`,
        outElem, 'large'
      );
      
      // If it's on top, prune it
      if (largeHeap.length > 0 && outElem === largeHeap[0]) {
        while (largeHeap.length > 0 && lazyTable[largeHeap[0]] > 0) {
          const v = popHeap(largeHeap, false)!;
          lazyTable[v]--;
          if (lazyTable[v] === 0) delete lazyTable[v];
        }
        snapshot('lazy', 
          `Prune Large: Fizično odstrani ${outElem} z vrha`,
          `Prune Large: Physically remove ${outElem} from top`,
          `Prune Large: Physisch ${outElem} von der Spitze entfernen`,
          outElem, 'large'
        );
      }
    }
    
    // Balance
    if (sz[0] > sz[1] + 1) {
      while (smallHeap.length > 0 && lazyTable[smallHeap[0]] > 0) {
        const v = popHeap(smallHeap, true)!;
        lazyTable[v]--;
        if (lazyTable[v] === 0) delete lazyTable[v];
      }
      const val = popHeap(smallHeap, true)!;
      pushHeap(largeHeap, val, false);
      sz[0]--;
      sz[1]++;
      snapshot('balance', 
        `Uravnoteženje: Premik ${val} Small → Large`,
        `Balance: Move ${val} Small → Large`,
        `Ausgleich: Verschiebe ${val} Small → Large`,
        val, 'both'
      );
    } else if (sz[0] < sz[1]) {
      while (largeHeap.length > 0 && lazyTable[largeHeap[0]] > 0) {
        const v = popHeap(largeHeap, false)!;
        lazyTable[v]--;
        if (lazyTable[v] === 0) delete lazyTable[v];
      }
      const val = popHeap(largeHeap, false)!;
      pushHeap(smallHeap, val, true);
      sz[1]--;
      sz[0]++;
      snapshot('balance', 
        `Uravnoteženje: Premik ${val} Large → Small`,
        `Balance: Move ${val} Large → Small`,
        `Ausgleich: Verschiebe ${val} Large → Small`,
        val, 'both'
      );
    }
    
    // Prune before median
    while (smallHeap.length > 0 && lazyTable[smallHeap[0]] > 0) {
      const v = popHeap(smallHeap, true)!;
      lazyTable[v]--;
      if (lazyTable[v] === 0) delete lazyTable[v];
    }
    while (largeHeap.length > 0 && lazyTable[largeHeap[0]] > 0) {
      const v = popHeap(largeHeap, false)!;
      lazyTable[v]--;
      if (lazyTable[v] === 0) delete lazyTable[v];
    }
    
    // Median
    const m = SIMPLE_K % 2 === 1 ? smallHeap[0] : (smallHeap[0] + largeHeap[0]) / 2;
    snapshot('median', 
      `Mediana okna [${currentWindow.join(', ')}] = ${m}`,
      `Median of window [${currentWindow.join(', ')}] = ${m}`,
      `Median des Fensters [${currentWindow.join(', ')}] = ${m}`,
      undefined, 'both'
    );
  }
  
  return steps;
}

export const SimpleMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language, t } = useLanguage();
  const steps = useMemo(() => generateSimpleSteps(), []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);

  React.useEffect(() => {
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
  
  const getDescription = (step: SimpleStep) => {
    if (language === 'en') return step.descriptionEn;
    if (language === 'de') return step.descriptionDe;
    return step.description;
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 p-4 font-sans flex flex-col overflow-hidden">
      <header className="mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {t('simple.title')}
            </h1>
            <p className="text-xs text-slate-400">{t('simple.subtitle')}</p>
          </div>
        </div>
        <LanguageSelector />
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left side: Array, Heaps, Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-h-0 overflow-y-auto">
          
          {/* Array visualization */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('simple.array')}</span>
              <span className="text-xs text-slate-500">k = {SIMPLE_K}</span>
            </div>
            <div className="flex gap-1.5 justify-center">
              {SIMPLE_DATA.map((val, idx) => {
                const inWindow = idx >= currentStep.windowStart && idx < currentStep.windowStart + currentStep.window.length;
                const isHighlight = val === currentStep.highlightElement;
                return (
                  <div
                    key={idx}
                    className={clsx(
                      "w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-300",
                      inWindow 
                        ? "bg-amber-500/30 border-2 border-amber-400 text-amber-200" 
                        : "bg-slate-700/50 border border-slate-600 text-slate-400",
                      isHighlight && "ring-2 ring-white scale-110"
                    )}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1.5 justify-center mt-1">
              {SIMPLE_DATA.map((_, idx) => (
                <div key={idx} className="w-11 text-center text-[10px] text-slate-500">
                  [{idx}]
                </div>
              ))}
            </div>
          </div>

          {/* Heaps - side by side */}
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-[200px]">
            <HeapViz 
              title={t('simple.smallHeap')} 
              data={currentStep.smallHeap} 
              isMax={true} 
              delayed={currentStep.lazyTable}
              highlight={currentStep.highlightHeap === 'small' || currentStep.highlightHeap === 'both'}
            />
            <HeapViz 
              title={t('simple.largeHeap')} 
              data={currentStep.largeHeap} 
              isMax={false} 
              delayed={currentStep.lazyTable}
              highlight={currentStep.highlightHeap === 'large' || currentStep.highlightHeap === 'both'}
            />
          </div>

          {/* Lazy Table & Median */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">{t('simple.lazyTable')}</div>
              <div className="font-mono text-base">
                {Object.keys(currentStep.lazyTable).length === 0 
                  ? <span className="text-slate-500">{'{ }'}</span>
                  : <span className="text-red-400">
                      {'{ '}
                      {Object.entries(currentStep.lazyTable).map(([k, v], i) => (
                        <span key={k}>
                          {i > 0 && ', '}
                          {k}: {v}
                        </span>
                      ))}
                      {' }'}
                    </span>
                }
              </div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">{t('simple.currentMedian')}</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {currentStep.median !== null ? currentStep.median : '—'}
              </div>
            </div>
          </div>

          {/* Controls & Description */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={currentStepIndex === 0}
                >
                  <SkipBack size={18} />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-bold text-sm",
                    isPlaying 
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                      : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  )}
                >
                  {isPlaying ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Play</>}
                </button>
                <button 
                  onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={currentStepIndex === steps.length - 1}
                >
                  <SkipForward size={18} />
                </button>
                <button 
                  onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                >
                  <option value={3000}>0.5x</option>
                  <option value={1500}>1x</option>
                  <option value={750}>2x</option>
                  <option value={300}>5x</option>
                </select>
                <span className="text-xs text-slate-500">
                  {t('simple.step')} {currentStepIndex + 1} / {steps.length}
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Description */}
            <div className={clsx(
              "p-3 rounded-lg text-sm font-medium",
              currentStep.phase === 'median' && "bg-amber-500/20 text-amber-200",
              currentStep.phase === 'lazy' && "bg-red-500/20 text-red-200",
              currentStep.phase === 'add' && "bg-emerald-500/20 text-emerald-200",
              currentStep.phase === 'balance' && "bg-purple-500/20 text-purple-200",
              currentStep.phase === 'init' && "bg-slate-700/50 text-slate-200",
              currentStep.phase === 'remove' && "bg-orange-500/20 text-orange-200"
            )}>
              {getDescription(currentStep)}
            </div>
          </div>
        </div>

        {/* Right side: Code (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-0">
          <CodeViewer 
            code={SIMPLE_CODE} 
            activeLines={currentStep.codeLines} 
          />
        </div>
      </div>
    </div>
  );
};
