import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { SAMPLE_DATA, K } from '../lib/algorithm';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';

export const IntroMode: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const maxSteps = SAMPLE_DATA.length - K + 1;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentWindow = useMemo(() => {
    return SAMPLE_DATA.slice(step, step + K);
  }, [step]);

  const stats = useMemo(() => {
    const sum = currentWindow.reduce((a, b) => a + b, 0);
    const avg = sum / K;
    
    const sorted = [...currentWindow].sort((a, b) => a - b);
    const mid = Math.floor(K / 2);
    const median = K % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return { avg, median };
  }, [currentWindow]);

  // Global stats for entire dataset
  const globalStats = useMemo(() => {
    const sum = SAMPLE_DATA.reduce((a, b) => a + b, 0);
    const avg = sum / SAMPLE_DATA.length;
    
    const sorted = [...SAMPLE_DATA].sort((a, b) => a - b);
    const mid = Math.floor(SAMPLE_DATA.length / 2);
    const median = SAMPLE_DATA.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return { avg, median };
  }, []);

  const isLastStep = step >= maxSteps - 1;

  // Story logic
  const hasHighOutlier = currentWindow.some(v => v > 200);
  const hasLowOutlier = currentWindow.some(v => v < 80);
  const isOutlierInWindow = hasHighOutlier || hasLowOutlier;
  const avgDiff = Math.abs(stats.avg - stats.median);
  const avgSpike = avgDiff > 30;
  
  let storyText = t('intro.stableMarket');
  let storyColor = "text-slate-400";
  
  if (isOutlierInWindow) {
    if (hasHighOutlier) {
      storyText = t('intro.outlierUp');
      storyColor = "text-red-400";
    } else if (hasLowOutlier) {
      storyText = t('intro.outlierDown');
      storyColor = "text-red-400";
    }
  }

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    const marginTop = 20;
    const marginBottom = 40;
    const marginLeft = 10;
    const marginRight = 60;
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Generate candle data
    const candleData = SAMPLE_DATA.map((close, idx) => {
      const prev = idx > 0 ? SAMPLE_DATA[idx - 1] : close;
      const open = prev;
      const range = Math.abs(close - open) * 0.3 + 3;
      const high = Math.max(open, close) + range;
      const low = Math.min(open, close) - range;
      return { index: idx, open, high, low, close };
    });

    const allPrices = candleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.15;
    const yMin = Math.max(0, minPrice - pricePadding); // Never go below 0
    const yMax = maxPrice + pricePadding;

    const priceToY = (price: number) => {
      return marginTop + chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight;
    };

    const candleWidth = chartWidth / candleData.length;
    const bodyWidth = candleWidth * 0.8; // Bigger candles

    // Clear
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#2a2e39';
    ctx.lineWidth = 1;
    const gridLines = 6;
    for (let i = 0; i <= gridLines; i++) {
      const y = marginTop + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(width - marginRight, y);
      ctx.stroke();
    }

    // Window highlight
    const windowX1 = marginLeft + step * candleWidth;
    const windowX2 = marginLeft + (step + K) * candleWidth;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.fillRect(windowX1, marginTop, windowX2 - windowX1, chartHeight);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(windowX1, marginTop, windowX2 - windowX1, chartHeight);
    ctx.setLineDash([]);

    // Median line
    const medianY = priceToY(stats.median);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(marginLeft, medianY);
    ctx.lineTo(width - marginRight, medianY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${t('intro.median')}: ${stats.median}`, width - marginRight + 5, medianY - 8);

    // Average line (always show)
    const avgY = priceToY(stats.avg);
    ctx.strokeStyle = avgSpike ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(marginLeft, avgY);
    ctx.lineTo(width - marginRight, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = avgSpike ? '#ef4444' : '#f59e0b';
    ctx.fillText(`${t('intro.average')}: ${stats.avg.toFixed(0)}`, width - marginRight + 5, avgY + 16);

    // Candlesticks
    candleData.forEach((candle, i) => {
      const x = marginLeft + i * candleWidth + candleWidth / 2;
      const isUp = candle.close >= candle.open;
      const inWindow = i >= step && i < step + K;
      const alpha = inWindow ? 1 : 0.35;
      
      const bullColor = `rgba(38, 166, 154, ${alpha})`;
      const bearColor = `rgba(239, 83, 80, ${alpha})`;
      const color = isUp ? bullColor : bearColor;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(candle.high));
      ctx.lineTo(x, priceToY(candle.low));
      ctx.stroke();

      // Body
      const bodyTop = priceToY(Math.max(candle.open, candle.close));
      const bodyBottom = priceToY(Math.min(candle.open, candle.close));
      const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });

    // Y-axis labels
    ctx.fillStyle = '#787b86';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i <= gridLines; i++) {
      const price = yMax - ((yMax - yMin) / gridLines) * i;
      const y = marginTop + (chartHeight / gridLines) * i;
      ctx.fillText(price.toFixed(0), width - marginRight + 5, y + 4);
    }

    // X-axis labels
    ctx.fillStyle = '#787b86';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    candleData.forEach((candle, i) => {
      const x = marginLeft + i * candleWidth + candleWidth / 2;
      ctx.fillText(`t${candle.index}`, x, height - 10);
    });

  }, [step, stats.median, stats.avg, avgSpike, t]);

  return (
    <div className="h-screen bg-[#0b1215] text-slate-200 p-8 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          {t('intro.back')}
        </button>
        <h1 className="text-2xl font-bold text-[#d1d4dc]">
          {t('intro.title')}
        </h1>
        <LanguageSelector />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[#131722] rounded-lg border border-[#2a2e39] flex flex-col shadow-xl overflow-hidden relative">
          <div className="p-4 border-b border-[#2a2e39] flex justify-between items-center bg-[#131722]">
             <div className="flex items-center gap-2">
                <span className="font-bold text-[#d1d4dc]">NVDA</span>
                <span className="text-xs bg-[#2a2e39] px-1 rounded text-[#787b86]">1D</span>
             </div>
          </div>
          
          <div className="flex-1 min-h-0 relative p-4">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Text Representation of Window */}
            <div className="absolute bottom-14 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-[#131722]/95 backdrop-blur-md px-6 py-3 rounded-xl border border-[#2a2e39] shadow-2xl flex items-center gap-2 font-mono text-lg">
                    {SAMPLE_DATA.map((val, i) => {
                        const inWindow = i >= step && i < step + K;
                        return (
                            <span key={i} className={inWindow ? "text-white font-bold scale-110 transition-transform" : "text-slate-600"}>
                                {i === step && <span className="text-blue-500 mr-2 text-2xl">[</span>}
                                {val}
                                {i === step + K - 1 && <span className="text-blue-500 ml-2 text-2xl">]</span>}
                                {i < SAMPLE_DATA.length - 1 && <span className="text-slate-700 mx-2">,</span>}
                            </span>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>

        {/* Stats & Story Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#131722] rounded-lg p-6 border border-[#2a2e39] flex-1 flex flex-col shadow-xl">
            <h3 className="text-sm font-bold text-[#787b86] mb-6 uppercase tracking-wider">{t('intro.windowAnalysis')} [{step + 1}/{SAMPLE_DATA.length - K + 1}]</h3>
            
            <div className="space-y-6 mb-8">
              <div className={`p-4 rounded border ${avgSpike ? 'bg-red-500/10 border-red-500/30' : 'bg-[#0b1215] border-[#2a2e39]'}`}>
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm text-[#787b86]">{t('intro.currentAverage')}</span>
                    <span className={`text-3xl font-mono font-bold ${avgSpike ? 'text-red-400' : 'text-orange-400'}`}>
                        {stats.avg.toFixed(1)}
                    </span>
                </div>
                {avgSpike && <div className="text-sm text-red-400 flex items-center gap-2 mt-2"><AlertTriangle size={16}/> {t('intro.distorted')}</div>}
              </div>

              <div className="p-4 rounded border bg-[#0b1215] border-[#2a2e39] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#22c55e]" />
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm text-[#787b86]">{t('intro.currentMedian')}</span>
                    <span className="text-3xl font-mono font-bold text-[#22c55e]">
                        {stats.median.toFixed(1)}
                    </span>
                </div>
                <div className="text-sm text-[#22c55e] flex items-center gap-2 mt-2"><TrendingUp size={16}/> {t('intro.realValue')}</div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center text-center p-6 bg-[#0b1215] rounded border border-[#2a2e39]">
                <p className={`text-xl font-medium leading-relaxed ${storyColor}`}>
                    "{storyText}"
                </p>
            </div>

            {/* Final summary when on last step */}
            {isLastStep && (
              <div className="mt-6 p-4 rounded border border-purple-500/30 bg-purple-500/10">
                <h4 className="text-sm font-bold text-purple-400 mb-3 uppercase tracking-wider">{t('intro.finalStats')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-[#787b86] mb-1">{t('intro.globalAverage')}</div>
                    <div className="text-2xl font-mono font-bold text-orange-400">{globalStats.avg.toFixed(1)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#787b86] mb-1">{t('intro.globalMedian')}</div>
                    <div className="text-2xl font-mono font-bold text-[#22c55e]">{globalStats.median.toFixed(1)}</div>
                  </div>
                </div>
                <p className="text-xs text-purple-300 mt-3 text-center">
                  {t('intro.outliersSummary')}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-4 rounded bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] font-medium transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => setStep(s => Math.min(s + 1, maxSteps - 1))}
              disabled={step >= maxSteps - 1}
              className="flex-1 py-4 rounded bg-[#2962ff] hover:bg-[#1e53e5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg"
            >
              {t('intro.nextStep')}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
