import React, { useEffect, useState } from 'react';
import { Building2, PhoneIncoming, BarChart3, Settings, ChevronLeft, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab: 'properties' | 'receptionist' | 'analytics' | 'settings';
  onTabChange: (tab: 'properties' | 'receptionist' | 'analytics' | 'settings') => void;
  isCollapsed: boolean;
  onToggle: () => void;
  isClientView?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  onToggle, 
  isClientView = false,
  isMobileOpen = false,
  onMobileClose
}) => {
  const [generalConfig, setGeneralConfig] = useState({ companyName: 'Imperial' });

  useEffect(() => {
    const stored = localStorage.getItem('app_general_config');
    if (stored) {
      setGeneralConfig(JSON.parse(stored));
    }
  }, [activeTab]);

  const menuItems = [
    { id: 'properties', label: 'Properties', icon: Building2 },
    ...(isClientView ? [] : [
      { id: 'receptionist', label: 'Receptionist', icon: PhoneIncoming },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ])
  ];

  const bottomItems = isClientView ? [] : [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-50 flex flex-col h-full bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        {/* Header */}
        <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-between'} transition-all`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center w-full' : ''}`}>
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50 shrink-0">
              <Building2 size={24} className="text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden whitespace-nowrap md:block">
                <h1 className="font-bold text-lg tracking-tight truncate w-32">{generalConfig.companyName}</h1>
                <p className="text-xs text-slate-400 font-medium">
                  {isClientView ? 'Client View' : 'Estates Admin'}
                </p>
              </div>
            )}
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button onClick={onToggle} className="hidden md:block text-slate-500 hover:text-white transition-colors">
            <ChevronLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Close Button */}
          <button onClick={onMobileClose} className="md:hidden text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Collapsed Menu Toggle (Desktop Only) */}
        {isCollapsed && (
          <div className="hidden md:flex w-full justify-center py-2 border-b border-slate-800">
             <button onClick={onToggle} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
               <Menu size={20} />
             </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as any)}
                className={`w-full flex items-center ${isCollapsed ? 'md:justify-center md:px-0' : 'justify-start px-4'} py-3 rounded-xl transition-all duration-200 font-medium relative group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} className="shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="ml-3">{item.label}</span>}
                
                {/* Desktop Tooltip */}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
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
                className={`w-full flex items-center ${isCollapsed ? 'md:justify-center md:px-0' : 'justify-start px-4'} py-3 rounded-xl transition-all duration-200 font-medium relative group ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="ml-3">{item.label}</span>}
                {isCollapsed && (
                  <div className="hidden md:block absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
