import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { IntroMode } from './components/IntroMode';
import { AlgoMode } from './components/AlgoMode';
import { SimpleMode } from './components/SimpleMode';
import { useLanguage } from './lib/i18n';

type ViewState = 'landing' | 'intro' | 'algo' | 'simple';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const { t } = useLanguage();

  useEffect(() => {
    try {
      document.title = t('app.title');
    } catch (e) {
      // ignore if running in non-browser environment
    }
  }, [t]);

  return (
    <>
      {view === 'landing' && (
        <LandingPage onSelectMode={(mode) => setView(mode)} />
      )}
      
      {view === 'intro' && (
        <IntroMode onBack={() => setView('landing')} />
      )}
      
      {view === 'algo' && (
        <AlgoMode onBack={() => setView('landing')} />
      )}
      
      {view === 'simple' && (
        <SimpleMode onBack={() => setView('landing')} />
      )}
    </>
  );
}

export default App;