import React, { useRef, useEffect } from 'react';

interface StockChartProps {
  data: number[];
  windowIndices: [number, number];
  median: number | null;
}

interface CandleData {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const StockChart: React.FC<StockChartProps> = ({ data, windowIndices, median }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [start, end] = windowIndices;

  // Generate candlestick data from prices
  const candleData: CandleData[] = data.map((close, idx) => {
    const prev = idx > 0 ? data[idx - 1] : close;
    const open = prev;
    // Simulate high/low with some variance
    const range = Math.abs(close - open) * 0.3 + 2;
    const high = Math.max(open, close) + range;
    const low = Math.min(open, close) - range;
    return { index: idx, open, high, low, close };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    // Chart margins
    const marginTop = 20;
    const marginBottom = 30;
    const marginLeft = 10;
    const marginRight = 60;
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Calculate price range
    const allPrices = candleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.15;
    const yMin = Math.max(0, minPrice - pricePadding); // Never go below 0
    const yMax = maxPrice + pricePadding;

    // Helper functions
    const priceToY = (price: number) => {
      return marginTop + chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight;
    };

    const candleWidth = chartWidth / candleData.length;
    const bodyWidth = candleWidth * 0.8; // Bigger candles

    // Clear canvas
    ctx.fillStyle = '#0b1215';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
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

    // Draw window highlight area
    const windowX1 = marginLeft + start * candleWidth;
    const windowX2 = marginLeft + (end + 1) * candleWidth;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.fillRect(windowX1, marginTop, windowX2 - windowX1, chartHeight);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(windowX1, marginTop, windowX2 - windowX1, chartHeight);
    ctx.setLineDash([]);

    // Draw median line
    if (median !== null) {
      const medianY = priceToY(median);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(marginLeft, medianY);
      ctx.lineTo(width - marginRight, medianY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Median label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(median.toFixed(2), width - marginRight + 5, medianY + 4);
    }

    // Draw candlesticks
    candleData.forEach((candle, i) => {
      const x = marginLeft + i * candleWidth + candleWidth / 2;
      const isUp = candle.close >= candle.open;
      const inWindow = i >= start && i <= end;
      const alpha = inWindow ? 1 : 0.35;
      
      const bullColor = `rgba(38, 166, 154, ${alpha})`; // TradingView green
      const bearColor = `rgba(239, 83, 80, ${alpha})`;   // TradingView red
      const color = isUp ? bullColor : bearColor;

      // Draw wick (high-low line)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(candle.high));
      ctx.lineTo(x, priceToY(candle.low));
      ctx.stroke();

      // Draw body
      const bodyTop = priceToY(Math.max(candle.open, candle.close));
      const bodyBottom = priceToY(Math.min(candle.open, candle.close));
      const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

      ctx.fillStyle = color;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);

      // Border for body
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });

    // Draw Y-axis labels (prices)
    ctx.fillStyle = '#787b86';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i <= gridLines; i++) {
      const price = yMax - ((yMax - yMin) / gridLines) * i;
      const y = marginTop + (chartHeight / gridLines) * i;
      ctx.fillText(price.toFixed(0), width - marginRight + 5, y + 4);
    }

    // Draw X-axis labels
    ctx.fillStyle = '#787b86';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    candleData.forEach((candle, i) => {
      const x = marginLeft + i * candleWidth + candleWidth / 2;
      ctx.fillText(`t${candle.index}`, x, height - 10);
    });

  }, [candleData, start, end, median]);

  const totalLength = data.length;
  const windowSize = end - start + 1;

  return (
    <div className="h-[400px] w-full bg-[#0b1215] rounded-xl border border-[#2a2e39] flex flex-col overflow-hidden shadow-2xl">
      <div className="px-4 py-3 border-b border-[#2a2e39] flex justify-between items-center bg-[#131722]">
        <div className="flex items-center gap-2">
          <span className="text-[#d1d4dc] font-bold">NVDA</span>
          <span className="text-[#5d606b] text-xs bg-[#2a2e39] px-1.5 py-0.5 rounded">1H</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 relative p-2">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Overlay Info for Window */}
        <div className="absolute top-4 left-4 bg-[#131722]/90 backdrop-blur border border-[#2a2e39] p-3 rounded shadow-lg pointer-events-none">
          <div className="text-[#787b86] text-xs uppercase mb-1">Pozicija Okna</div>
          
          {/* Visual interval indicator - shows window position within full data */}
          <div className="mb-2 flex items-center gap-1 font-mono text-sm">
            {data.map((val, i) => {
              const isWindowStart = i === start;
              const isWindowEnd = i === end;
              const inWindow = i >= start && i <= end;
              return (
                <span key={i} className="flex items-center">
                  {isWindowStart && <span className="text-blue-400 text-lg font-bold mr-0.5">[</span>}
                  <span className={`px-1.5 py-0.5 rounded ${
                    inWindow 
                      ? 'bg-blue-500 text-white font-bold' 
                      : 'text-[#5d606b]'
                  }`}>
                    {val}
                  </span>
                  {isWindowEnd && <span className="text-blue-400 text-lg font-bold ml-0.5">]</span>}
                </span>
              );
            })}
          </div>
          
          {/* Progress bar style indicator */}
          <div className="w-full h-2 bg-[#2a2e39] rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 rounded-full"
              style={{ 
                marginLeft: `${(start / totalLength) * 100}%`,
                width: `${(windowSize / totalLength) * 100}%` 
              }}
            />
          </div>
          
          <div className="flex gap-4">
            <div>
              <div className="text-[#5d606b] text-[10px]">Index</div>
              <div className="text-[#d1d4dc] font-mono">{start} - {end}</div>
            </div>
            <div>
              <div className="text-[#5d606b] text-[10px]">Mediana</div>
              <div className="text-[#22c55e] font-mono font-bold">{median?.toFixed(2) ?? '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};