import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PropertyManager from './components/PropertyManager';
import CallHistory from './components/CallHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState<'properties' | 'receptionist' | 'analytics' | 'settings'>('properties');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClientView, setIsClientView] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    // Check URL parameters for client view mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'client') {
      setIsClientView(true);
      setActiveTab('properties');
    }
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?view=client`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const renderContent = () => {
    // Force PropertyManager in client view
    if (isClientView) {
      return <PropertyManager readOnly={true} />;
    }

    switch (activeTab) {
      case 'properties':
        return <PropertyManager readOnly={false} onShare={handleShare} />;
      case 'receptionist':
        return <CallHistory />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <PropertyManager readOnly={false} onShare={handleShare} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isClientView={isClientView}
      />
      
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar relative">
        {showShareToast && (
            <div className="absolute top-6 right-6 z-50 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
              <Check size={14} className="text-emerald-400" />
              Link copied to clipboard!
            </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}

export default App;
