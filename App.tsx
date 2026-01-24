import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Check, Menu, X as XIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PropertyManager from './components/PropertyManager';
import CallHistory from './components/CallHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Settings from './components/Settings';
import VoiceAssistant from './components/VoiceAssistant';
import AdminGuard from './components/AdminGuard';

// Layout Component that handles Sidebar and common UI
const DashboardLayout = ({ isClientView }: { isClientView: boolean }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'receptionist' | 'analytics' | 'settings'>('properties');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Initialize Theme on Mount
  useEffect(() => {
    const storedGeneral = localStorage.getItem('app_general_config');
    if (storedGeneral) {
      const config = JSON.parse(storedGeneral);
      if (config.appearance === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/client`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const renderContent = () => {
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
    <div className="h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg tracking-tight">Imperial Estates</span>
        </div>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isClientView={isClientView}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar relative w-full">
        {showShareToast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
               <Check size={20} className="shrink-0" />
               <div className="flex-1">
                  <p className="font-black text-xs uppercase tracking-widest">Portal Sync</p>
                  <p className="text-sm font-bold opacity-90">Client URL copied to clipboard</p>
               </div>
               <button onClick={() => setShowShareToast(false)} className="ml-2 hover:bg-white/10 p-1 rounded-lg transition-colors">
                  <XIcon size={16} />
               </button>
            </div>
        )}
        
        {renderContent()}
        <VoiceAssistant />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route 
        path="/aegissa" 
        element={
          <AdminGuard>
            <DashboardLayout isClientView={false} />
          </AdminGuard>
        } 
      />
      <Route path="/client" element={<DashboardLayout isClientView={true} />} />
      <Route path="/" element={<Navigate to="/aegissa" replace />} />
    </Routes>
  );
};

export default App;
