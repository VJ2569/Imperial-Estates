import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Check, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import PropertyManager from './components/PropertyManager';
import CallHistory from './components/CallHistory';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Settings from './components/Settings';
import VoiceAssistant from './components/VoiceAssistant';

// Layout Component that handles Sidebar and common UI
const DashboardLayout = ({ isClientView }: { isClientView: boolean }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'receptionist' | 'analytics' | 'settings'>('properties');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    // Generate the clean client URL
    const url = `${window.location.origin}/client`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const renderContent = () => {
    // Enforce view mode
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
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
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
            <div className="absolute top-6 right-6 left-6 md:left-auto z-50 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl flex items-center justify-center md:justify-start gap-2 animate-in slide-in-from-top-2 fade-in">
              <Check size={14} className="text-emerald-400" />
              Link copied to clipboard!
            </div>
        )}

        {renderContent()}

        {/* Add Voice Assistant only for Admin View */}
        {!isClientView && <VoiceAssistant />}
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/aegis" element={<DashboardLayout isClientView={false} />} />
      <Route path="/client" element={<DashboardLayout isClientView={true} />} />
      {/* Default redirect to aegis view  */}
      <Route path="*" element={<Navigate to="/aegis" replace />} />
    </Routes>
  );
}

export default App;
