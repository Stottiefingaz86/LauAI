import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  User
} from 'lucide-react';
import Dock from './Dock';
import { useAuth } from '../contexts/AuthContext';

const AppShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: BarChart3 },
    { name: 'Teams', href: '/app/teams', icon: Users },
    { name: 'Surveys', href: '/app/surveys', icon: MessageSquare },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden glass-modal"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full glass-sidebar">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-white/10">
            <span className="text-xl font-bold bg-gradient-to-r from-mint via-green-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
              LauAI
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-mint text-gray-900 shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.email || 'User'
                  }
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.user_metadata?.role || 'Member'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Pushed to the right on desktop */}
      <div className="lg:ml-64">
        {/* Top Navigation - Fixed */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-30 glass-topnav">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden glass-button p-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-white">
                  {navigation.find(item => isActive(item.href))?.name || 'SignalOS'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/70">christopher.hunt86@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Page Content - With top margin to account for fixed header */}
        <main className="pt-16 p-6 pb-24">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Dock - Fixed at bottom */}
      <Dock />
    </div>
  );
};

export default AppShell; 