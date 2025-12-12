import React, { useEffect, useState } from 'react';
import { Building2, PhoneIncoming, BarChart3, Settings, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface SidebarProps {
  activeTab: 'properties' | 'receptionist' | 'analytics' | 'settings';
  onTabChange: (tab: 'properties' | 'receptionist' | 'analytics' | 'settings') => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isClientView?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isCollapsed, onToggle, isClientView = false }) => {
  const [generalConfig, setGeneralConfig] = useState({ companyName: 'Imperial' });

  useEffect(() => {
    // Read company name from local storage for custom branding
    const stored = localStorage.getItem('app_general_config');
    if (stored) {
      setGeneralConfig(JSON.parse(stored));
    }
  }, [activeTab]); // Refresh when tab changes (in case we just saved settings)

  // Filter menu items based on Client View
  const menuItems = [
    { id: 'properties', label: 'Properties', icon: Building2 },
    ...(isClientView ? [] : [
      { id: 'receptionist', label: 'Receptionist', icon: PhoneIncoming },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ])
  ];

  // Hide bottom items in Client View
  const bottomItems = isClientView ? [] : [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex flex-col h-screen sticky top-0 left-0 shadow-2xl z-40 transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50 shrink-0">
            <Building2 size={24} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-lg tracking-tight truncate w-32">{generalConfig.companyName}</h1>
              <p className="text-xs text-slate-400 font-medium">
                {isClientView ? 'Client View' : 'Estates Admin'}
              </p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button onClick={onToggle} className="text-slate-500 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
      
      {/* Toggle Button for Collapsed State */}
      {isCollapsed && (
        <div className="w-full flex justify-center py-2 border-b border-slate-800">
           <button onClick={onToggle} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
             <Menu size={20} />
           </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl transition-all duration-200 font-medium relative group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-800 space-y-2">
         {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 rounded-xl transition-all duration-200 font-medium relative group ${
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;