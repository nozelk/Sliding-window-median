import React from 'react';
import { TrendingUp, Code2, BarChart3, ExternalLink, Github, Layers } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';

interface LandingPageProps {
  onSelectMode: (mode: 'intro' | 'algo' | 'simple') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 text-center mb-16 max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <a 
            href="https://leetcode.com/problems/sliding-window-median/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-sm backdrop-blur-sm hover:border-orange-500/50 hover:text-orange-400 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            {t('landing.leetcode')}
            <ExternalLink className="w-3 h-3" />
          </a>
          <a 
            href="https://github.com/nozelk/Sliding-window-median"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-sm backdrop-blur-sm hover:border-purple-500/50 hover:text-purple-400 transition-all"
          >
            <Github className="w-4 h-4" />
            {t('landing.viewCode')}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          {t('landing.title1')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {t('landing.title2')}
          </span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed">
          {t('landing.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full z-10">
        {/* Simple Mode - NEW */}
        <button
          onClick={() => onSelectMode('simple')}
          className="group relative bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10"
        >
          <div className="absolute top-8 right-8 p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
            <Layers className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
            {t('landing.simple')}
          </h3>
          <p className="text-slate-400 mb-6">
            {t('landing.simpleDesc')}
          </p>
          <div className="flex items-center text-sm font-medium text-amber-400 group-hover:translate-x-1 transition-transform">
            {t('landing.startSimple')} <TrendingUp className="w-4 h-4 ml-2" />
          </div>
        </button>

        <button
          onClick={() => onSelectMode('intro')}
          className="group relative bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div className="absolute top-8 right-8 p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
            {t('landing.whyMedian')}
          </h3>
          <p className="text-slate-400 mb-6">
            {t('landing.whyMedianDesc')}
          </p>
          <div className="flex items-center text-sm font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
            {t('landing.startSimulation')} <TrendingUp className="w-4 h-4 ml-2" />
          </div>
        </button>

        <button
          onClick={() => onSelectMode('algo')}
          className="group relative bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
        >
          <div className="absolute top-8 right-8 p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
            <Code2 className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
            {t('landing.algorithm')}
          </h3>
          <p className="text-slate-400 mb-6">
            {t('landing.algorithmDesc')}
          </p>
          <div className="flex items-center text-sm font-medium text-purple-400 group-hover:translate-x-1 transition-transform">
            {t('landing.openVisualization')} <TrendingUp className="w-4 h-4 ml-2" />
          </div>
        </button>
      </div>
    </div>
  );
};
