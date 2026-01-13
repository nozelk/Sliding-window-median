import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useLanguage } from '../lib/i18n';

interface HeapVizProps {
  title: string;
  data: number[];
  isMax: boolean;
  delayed: Record<number, number>;
  highlight?: boolean;
}

export const HeapViz: React.FC<HeapVizProps> = ({ title, data, isMax, delayed, highlight }) => {
  const { language } = useLanguage();
  
  // Colors: Max heap = green, Min heap = blue
  const bgColor = isMax ? 'bg-emerald-500' : 'bg-blue-500';
  const textColor = isMax ? 'text-emerald-100' : 'text-blue-100';
  const lineColorHex = isMax ? '#34d399' : '#60a5fa';
  
  // Translate empty heap message
  const emptyHeapMsg = {
    si: 'Prazna kopica',
    en: 'Empty heap',
    de: 'Leerer Heap'
  };
  
  // Calculate positions for binary tree layout
  const getNodePosition = (index: number, totalWidth: number) => {
    const level = Math.floor(Math.log2(index + 1));
    const levelStart = Math.pow(2, level) - 1;
    const posInLevel = index - levelStart;
    
    const levelWidth = totalWidth / Math.pow(2, level);
    const x = levelWidth * (posInLevel + 0.5);
    const y = level * 70 + 35;
    
    return { x, y, level };
  };

  const containerWidth = 280;
  const maxLevel = data.length > 0 ? Math.floor(Math.log2(data.length)) : 0;
  const treeHeight = (maxLevel + 1) * 70 + 40;

  return (
    <div className={clsx(
      "rounded-xl border-2 transition-colors duration-300 flex flex-col h-full",
      highlight ? "border-yellow-400 bg-yellow-400/5" : "border-slate-700/50 bg-slate-800/50"
    )}>
      <h3 className="text-base font-bold py-3 text-center text-slate-200 border-b border-slate-700/50">{title}</h3>
      
      {/* Tree visualization */}
      <div className="relative flex-1 flex items-center justify-center p-4" style={{ minHeight: Math.max(150, treeHeight) }}>
        {data.length === 0 ? (
          <div className="text-slate-500 text-sm italic">{emptyHeapMsg[language]}</div>
        ) : (
          <div className="relative" style={{ width: containerWidth, height: treeHeight }}>
            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {data.map((_, idx) => {
                if (idx === 0) return null;
                const parentIdx = Math.floor((idx - 1) / 2);
                const parentPos = getNodePosition(parentIdx, containerWidth);
                const childPos = getNodePosition(idx, containerWidth);
                
                return (
                  <line
                    key={`edge-${idx}`}
                    x1={parentPos.x}
                    y1={parentPos.y + 18}
                    x2={childPos.x}
                    y2={childPos.y - 18}
                    stroke={lineColorHex}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                  />
                );
              })}
            </svg>
            
            {/* Nodes */}
            <AnimatePresence mode='popLayout'>
              {data.map((val, idx) => {
                const pos = getNodePosition(idx, containerWidth);
                const isDelayed = delayed[val] && delayed[val] > 0;
                const isRoot = idx === 0;
                const size = isRoot ? 44 : 36;
                
                return (
                  <motion.div
                    key={`${val}-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: isDelayed ? 0.4 : 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={clsx(
                      "absolute flex items-center justify-center font-bold rounded-full shadow-lg",
                      bgColor,
                      textColor,
                      isRoot && "ring-2 ring-white/30",
                      isDelayed && "opacity-40 line-through"
                    )}
                    style={{
                      width: size,
                      height: size,
                      left: pos.x - size / 2,
                      top: pos.y - size / 2,
                      fontSize: isRoot ? '16px' : '14px'
                    }}
                  >
                    {val}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <div className="py-2 text-xs text-center text-slate-500 border-t border-slate-700/50">
        {isMax ? "↑ Vrh = MAX" : "↑ Vrh = MIN"}
      </div>
    </div>
  );
};