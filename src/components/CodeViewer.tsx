import React, { useEffect, useRef } from 'react';

interface CodeViewerProps {
  code: string;
  activeLines: number[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, activeLines }) => {
  const lines = code.split('\n');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeLines.length > 0 && scrollRef.current) {
      const firstActiveLine = activeLines[0];
      const lineElement = scrollRef.current.children[firstActiveLine - 1] as HTMLElement;
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLines]);

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl h-full flex flex-col">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-slate-400 text-xs font-mono ml-2">480.py</span>
      </div>
      <div ref={scrollRef} className="p-4 overflow-y-auto font-mono text-sm flex-1">
        {lines.map((line, i) => {
          const lineNumber = i + 1;
          const isActive = activeLines.includes(lineNumber);
          return (
            <div
              key={i}
              className={`flex ${
                isActive ? 'bg-blue-500/20 -mx-4 px-4 border-l-2 border-blue-500' : ''
              }`}
            >
              <span className="text-slate-600 w-8 text-right mr-4 select-none flex-shrink-0">
                {lineNumber}
              </span>
              <pre className={`${isActive ? 'text-blue-100' : 'text-slate-300'}`}>
                {line}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};
