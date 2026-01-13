import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'si' | 'en' | 'de';

type Translations = {
  [key: string]: {
    si: string;
    en: string;
    de: string;
  };
};

export const translations: Translations = {
  // Landing Page
  'landing.title1': {
    si: 'Sliding Window',
    en: 'Sliding Window',
    de: 'Sliding Window',
  },
  'landing.title2': {
    si: 'Median Algorithm',
    en: 'Median Algorithm',
    de: 'Median Algorithmus',
  },
  'landing.description': {
    si: 'Napredna vizualizacija algoritma za iskanje mediane v drsečem oknu. Primerjava robustnosti mediane proti povprečju in prikaz delovanja Dual-Heap pristopa.',
    en: 'Advanced visualization of the sliding window median algorithm. Comparison of median robustness versus average and demonstration of the Dual-Heap approach.',
    de: 'Erweiterte Visualisierung des Sliding-Window-Median-Algorithmus. Vergleich der Robustheit des Medians gegenüber dem Durchschnitt und Demonstration des Dual-Heap-Ansatzes.',
  },
  'landing.leetcode': {
    si: 'LeetCode Problem 480',
    en: 'LeetCode Problem 480',
    de: 'LeetCode Problem 480',
  },
  'landing.viewCode': {
    si: 'Izvorna koda',
    en: 'View Code',
    de: 'Quellcode',
  },
  'landing.whyMedian': {
    si: 'Zakaj Mediana?',
    en: 'Why Median?',
    de: 'Warum Median?',
  },
  'landing.whyMedianDesc': {
    si: 'Interaktivna simulacija borznega tečaja, ki prikazuje prednost mediane pred povprečjem pri filtriranju šuma in osamelcev.',
    en: 'Interactive stock price simulation showing the advantage of median over average when filtering noise and outliers.',
    de: 'Interaktive Börsenkurssimulation, die den Vorteil des Medians gegenüber dem Durchschnitt beim Filtern von Rauschen und Ausreißern zeigt.',
  },
  'landing.startSimulation': {
    si: 'Zaženi simulacijo',
    en: 'Start simulation',
    de: 'Simulation starten',
  },
  'landing.algorithm': {
    si: 'Algoritem (Dual Heap)',
    en: 'Algorithm (Dual Heap)',
    de: 'Algorithmus (Dual Heap)',
  },
  'landing.algorithmDesc': {
    si: 'Podroben korak-po-korak prikaz delovanja algoritma z dvema kopicama in "lazy deletion" tehniko. Povezava s Python kodo.',
    en: 'Detailed step-by-step demonstration of the algorithm using two heaps and "lazy deletion" technique. Connected to Python code.',
    de: 'Detaillierte Schritt-für-Schritt-Demonstration des Algorithmus mit zwei Heaps und "Lazy Deletion"-Technik. Verbunden mit Python-Code.',
  },
  'landing.openVisualization': {
    si: 'Odpri vizualizacijo',
    en: 'Open visualization',
    de: 'Visualisierung öffnen',
  },
  'app.title': {
    si: 'Vizualizacija drseče mediane',
    en: 'Sliding Window Median Visualizer',
    de: 'Visualisierung des Sliding-Window-Medians',
  },
  
  // IntroMode
  'intro.back': {
    si: '← Nazaj',
    en: '← Back',
    de: '← Zurück',
  },
  'intro.title': {
    si: 'Povprečje vs. Mediana',
    en: 'Average vs. Median',
    de: 'Durchschnitt vs. Median',
  },
  'intro.windowAnalysis': {
    si: 'Analiza Okna',
    en: 'Window Analysis',
    de: 'Fensteranalyse',
  },
  'intro.currentAverage': {
    si: 'Trenutno Povprečje',
    en: 'Current Average',
    de: 'Aktueller Durchschnitt',
  },
  'intro.currentMedian': {
    si: 'Trenutna Mediana',
    en: 'Current Median',
    de: 'Aktueller Median',
  },
  'intro.distorted': {
    si: 'Močno popačeno!',
    en: 'Heavily distorted!',
    de: 'Stark verzerrt!',
  },
  'intro.realValue': {
    si: 'Realna vrednost',
    en: 'Real value',
    de: 'Realer Wert',
  },
  'intro.stableMarket': {
    si: 'Trg je stabilen. Povprečje in mediana kažeta podobno sliko.',
    en: 'Market is stable. Average and median show similar picture.',
    de: 'Markt ist stabil. Durchschnitt und Median zeigen ein ähnliches Bild.',
  },
  'intro.outlierUp': {
    si: '⚠️ OSAMELEC NAVZGOR! Visoka vrednost (450) je drastično dvignila povprečje. Mediana ostaja stabilna.',
    en: '⚠️ OUTLIER UP! High value (450) has drastically raised the average. Median remains stable.',
    de: '⚠️ AUSREISSER NACH OBEN! Hoher Wert (450) hat den Durchschnitt drastisch erhöht. Median bleibt stabil.',
  },
  'intro.outlierDown': {
    si: '⚠️ OSAMELEC NAVZDOL! Nizka vrednost (50) je drastično znižala povprečje. Mediana ostaja stabilna.',
    en: '⚠️ OUTLIER DOWN! Low value (50) has drastically lowered the average. Median remains stable.',
    de: '⚠️ AUSREISSER NACH UNTEN! Niedriger Wert (50) hat den Durchschnitt drastisch gesenkt. Median bleibt stabil.',
  },
  'intro.finalStats': {
    si: '📊 Končna Statistika (Celoten Niz)',
    en: '📊 Final Statistics (Entire Array)',
    de: '📊 Endstatistik (Gesamtes Array)',
  },
  'intro.globalAverage': {
    si: 'Globalno Povprečje',
    en: 'Global Average',
    de: 'Globaler Durchschnitt',
  },
  'intro.globalMedian': {
    si: 'Globalna Mediana',
    en: 'Global Median',
    de: 'Globaler Median',
  },
  'intro.outliersSummary': {
    si: 'Osamelci (450, 50) popačijo povprečje, mediana ostane robustna!',
    en: 'Outliers (450, 50) distort the average, median remains robust!',
    de: 'Ausreißer (450, 50) verzerren den Durchschnitt, Median bleibt robust!',
  },
  'intro.nextStep': {
    si: 'Naslednji korak',
    en: 'Next step',
    de: 'Nächster Schritt',
  },
  'intro.median': {
    si: 'Mediana',
    en: 'Median',
    de: 'Median',
  },
  'intro.average': {
    si: 'Povpr.',
    en: 'Avg.',
    de: 'Durchs.',
  },
  
  // AlgoMode
  'algo.title': {
    si: 'Dual Heap Algoritem',
    en: 'Dual Heap Algorithm',
    de: 'Dual Heap Algorithmus',
  },
  'algo.subtitle': {
    si: 'Vizualizacija kode in podatkovnih struktur',
    en: 'Code and data structure visualization',
    de: 'Code- und Datenstrukturvisualisierung',
  },
  'algo.step': {
    si: 'Korak',
    en: 'Step',
    de: 'Schritt',
  },
  'algo.currentAction': {
    si: 'Trenutna akcija',
    en: 'Current action',
    de: 'Aktuelle Aktion',
  },
  'algo.heapState': {
    si: 'Stanje Kopic',
    en: 'Heap State',
    de: 'Heap-Zustand',
  },
  'algo.leftHeap': {
    si: 'Leva (Max Heap)',
    en: 'Left (Max Heap)',
    de: 'Links (Max Heap)',
  },
  'algo.rightHeap': {
    si: 'Desna (Min Heap)',
    en: 'Right (Min Heap)',
    de: 'Rechts (Min Heap)',
  },
  'algo.finalMedian': {
    si: 'Mediana median',
    en: 'Median of medians',
    de: 'Median der Mediane',
  },
  'algo.allMedians': {
    si: 'Vse mediane',
    en: 'All medians',
    de: 'Alle Mediane',
  },
  'algo.completed': {
    si: '✅ Algoritem zaključen!',
    en: '✅ Algorithm completed!',
    de: '✅ Algorithmus abgeschlossen!',
  },
  
  // Algorithm step descriptions
  'step.init': {
    si: 'Inicializacija: prazne kopice',
    en: 'Initialization: empty heaps',
    de: 'Initialisierung: leere Heaps',
  },
  'step.addWindow': {
    si: 'Dodaj v okno',
    en: 'Add to window',
    de: 'Zum Fenster hinzufügen',
  },
  'step.addHeapSmall': {
    si: 'Dodaj v Levo kopico (manjši)',
    en: 'Add to Left heap (smaller)',
    de: 'Zum linken Heap hinzufügen (kleiner)',
  },
  'step.addHeapLarge': {
    si: 'Dodaj v Desno kopico (večji)',
    en: 'Add to Right heap (larger)',
    de: 'Zum rechten Heap hinzufügen (größer)',
  },
  'step.balanceSmallToLarge': {
    si: 'Uravnoteženje: Premik iz Leve v Desno',
    en: 'Balancing: Move from Left to Right',
    de: 'Ausbalancieren: Von Links nach Rechts verschieben',
  },
  'step.balanceLargeToSmall': {
    si: 'Uravnoteženje: Premik iz Desne v Levo',
    en: 'Balancing: Move from Right to Left',
    de: 'Ausbalancieren: Von Rechts nach Links verschieben',
  },
  'step.lazyDeleteSmall': {
    si: 'Lazy delete (Small): Odstranim iz vrha',
    en: 'Lazy delete (Small): Remove from top',
    de: 'Lazy Delete (Small): Von oben entfernen',
  },
  'step.lazyDeleteLarge': {
    si: 'Lazy delete (Large): Odstranim iz vrha',
    en: 'Lazy delete (Large): Remove from top',
    de: 'Lazy Delete (Large): Von oben entfernen',
  },
  'step.markForDeletion': {
    si: 'Označi za izbris (delayed)',
    en: 'Mark for deletion (delayed)',
    de: 'Zum Löschen markieren (verzögert)',
  },
  'step.windowMove': {
    si: 'Okno se premakne',
    en: 'Window moves',
    de: 'Fenster bewegt sich',
  },
  'step.firstWindowMedian': {
    si: 'Mediana prvega okna',
    en: 'First window median',
    de: 'Median des ersten Fensters',
  },
  'step.newMedian': {
    si: 'Nova mediana',
    en: 'New median',
    de: 'Neuer Median',
  },
  
  // Landing page - Simple mode
  'landing.simple': {
    si: 'Enostaven Primer',
    en: 'Simple Example',
    de: 'Einfaches Beispiel',
  },
  'landing.simpleDesc': {
    si: 'Korak-po-korak prikaz z majhnim array [45, 49, 9, 51, 109, 30, 85] in k=3. Fokus na kopicah in lazy deletion.',
    en: 'Step-by-step walkthrough with small array [45, 49, 9, 51, 109, 30, 85] and k=3. Focus on heaps and lazy deletion.',
    de: 'Schritt-für-Schritt-Durchgang mit kleinem Array [45, 49, 9, 51, 109, 30, 85] und k=3. Fokus auf Heaps und Lazy Deletion.',
  },
  'landing.startSimple': {
    si: 'Zaženi primer',
    en: 'Start example',
    de: 'Beispiel starten',
  },
  
  // Simple mode
  'simple.title': {
    si: 'Enostaven Primer',
    en: 'Simple Example',
    de: 'Einfaches Beispiel',
  },
  'simple.subtitle': {
    si: 'Array [45, 49, 9, 51, 109, 30, 85], k = 3',
    en: 'Array [45, 49, 9, 51, 109, 30, 85], k = 3',
    de: 'Array [45, 49, 9, 51, 109, 30, 85], k = 3',
  },
  'simple.array': {
    si: 'Vhodni Array',
    en: 'Input Array',
    de: 'Eingabe-Array',
  },
  'simple.smallHeap': {
    si: 'Small (Max-Heap)',
    en: 'Small (Max-Heap)',
    de: 'Small (Max-Heap)',
  },
  'simple.largeHeap': {
    si: 'Large (Min-Heap)',
    en: 'Large (Min-Heap)',
    de: 'Large (Min-Heap)',
  },
  'simple.lazyTable': {
    si: 'Lazy Tabela',
    en: 'Lazy Table',
    de: 'Lazy-Tabelle',
  },
  'simple.currentMedian': {
    si: 'Trenutna Mediana',
    en: 'Current Median',
    de: 'Aktueller Median',
  },
  'simple.step': {
    si: 'Korak',
    en: 'Step',
    de: 'Schritt',
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('si');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
