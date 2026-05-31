import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { ZakatFeature } from './features/zakat/ZakatFeature';
import { MirasFeature } from './features/miras/MirasFeature';
import { HajjFeature } from './features/hajj/HajjFeature';
import { FitraFeature } from './features/fitra/FitraFeature';
import { QurbaniFeature } from './features/qurbani/QurbaniFeature';
import { UshrFeature } from './features/ushr/UshrFeature';
import { MasturatFeature } from './features/masturat/MasturatFeature';
import { HistoryPanel } from './components/HistoryPanel';
import { useHistory, type HistoryEntry } from './hooks/useHistory';
import { SettingsFeature } from './features/settings/SettingsFeature';
import { useSettings } from './hooks/useSettings';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const settingsHook = useSettings();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryEntry | null>(null);

  const { history, addHistoryEntry, deleteHistoryEntry, clearHistory } = useHistory();

  // Helper to change tab manually and reset loaded history items
  const handleTabChange = (tab: string) => {
    setSelectedHistoryItem(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setSelectedHistoryItem(entry);
    setActiveTab(entry.toolType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveHistory = (toolType: HistoryEntry['toolType'], toolName: string, summary: string, inputs: any, result: any) => {
    addHistoryEntry(toolType, toolName, summary, inputs, result);
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      historyCount={history.length}
      onOpenHistory={() => setIsHistoryOpen(true)}
      developer={settingsHook.developer}
    >
      {/* SPA Tab Routers */}
      {activeTab === 'home' && (
        <Dashboard onSelectTool={handleTabChange} />
      )}

      {activeTab === 'zakat' && (
        <ZakatFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('zakat', 'যাকাত ক্যালকুলেটর', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'zakat' ? selectedHistoryItem : undefined}
          settingsHook={settingsHook}
        />
      )}

      {activeTab === 'miras' && (
        <MirasFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('miras', 'মীরাস (উত্তরাধিকার)', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'miras' ? selectedHistoryItem : undefined}
        />
      )}

      {activeTab === 'hajj' && (
        <HajjFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('hajj', 'হজ্জ প্ল্যানার ও যোগ্যতা', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'hajj' ? selectedHistoryItem : undefined}
        />
      )}

      {activeTab === 'fitra' && (
        <FitraFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('fitra', 'সাদকাতুল ফিতর', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'fitra' ? selectedHistoryItem : undefined}
          settingsHook={settingsHook}
        />
      )}

      {activeTab === 'qurbani' && (
        <QurbaniFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('qurbani', 'কুরবানী যোগ্যতা ও হিসাব', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'qurbani' ? selectedHistoryItem : undefined}
          settingsHook={settingsHook}
        />
      )}

      {activeTab === 'ushr' && (
        <UshrFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('ushr', 'উশর (ফসলের যাকাত)', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'ushr' ? selectedHistoryItem : undefined}
        />
      )}

      {activeTab === 'masturat' && (
        <MasturatFeature
          onSaveHistory={(sum, inp, res) => handleSaveHistory('masturat', 'মাস্তুরাত সংক্রান্ত', sum, inp, res)}
          initialState={selectedHistoryItem?.toolType === 'masturat' ? selectedHistoryItem : undefined}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsFeature
          onBackToDashboard={() => handleTabChange('home')}
          settingsHook={settingsHook}
        />
      )}
      {/* History Drawer Slider */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectEntry={handleSelectHistoryEntry}
        onDeleteEntry={deleteHistoryEntry}
        onClearHistory={clearHistory}
      />
    </AppLayout>
  );
}

export default App;
