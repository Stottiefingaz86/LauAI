import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  X,
  User,
  Bell,
  Search,
  CreditCard,
  Crown,
  Shield,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Dock from './Dock';
import Logo from './Logo';

const AppShell = ({ children }) => {
  const { user, signOut, isAdmin, isMember, isManager, isLeader, isMasterAccount, billingInfo } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Teams', icon: Users, path: '/teams' },
        { name: 'Surveys', icon: BarChart3, path: '/surveys' },
        { name: 'Billing', icon: CreditCard, path: '/billing' }
      ];
    } else if (isManager) {
      return [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Surveys', icon: BarChart3, path: '/surveys' }
      ];
    } else if (isLeader) {
      return [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Surveys', icon: BarChart3, path: '/surveys' }
      ];
    } else if (isMember) {
      return [
        { name: 'My Surveys', icon: BarChart3, path: '/surveys' }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const getCurrentPageName = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  const handleSignOut = async () => {
    try {
      console.log('AppShell: Starting sign out...');
      const { error } = await signOut();
      
      if (error) {
        console.error('AppShell: Sign out error:', error);
      }
      
      console.log('AppShell: Sign out successful, navigating to login...');
      window.location.href = '/';
    } catch (error) {
      console.error('AppShell: Unexpected error during sign out:', error);
      window.location.href = '/';
    }
  };

  const getRoleDisplayName = () => {
    if (isMasterAccount) return 'Master';
    if (isAdmin) return 'Admin';
    if (isManager) return 'Manager';
    if (isLeader) return 'Leader';
    return 'Member';
  };

  const getRoleBadge = () => {
    if (isMasterAccount) {
      return (
        <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
          <Crown size={10} />
          <span>Master</span>
        </div>
      );
    }
    if (isAdmin) {
      return (
        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <Shield size={10} />
          <span>Admin</span>
        </div>
      );
    }
    if (isManager) {
      return (
        <div className="flex items-center gap-1 bg-gradient-to-r from-purple-400 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <Users size={10} />
          <span>Manager</span>
        </div>
      );
    }
    if (isLeader) {
      return (
        <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-400 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <Star size={10} />
          <span>Leader</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs font-medium">
        <User size={10} />
        <span>Member</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <Link to="/dashboard" className="flex items-center justify-center">
              <Logo size="xl" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 p-3 rounded-lg text-gray-300">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  My Account
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {getRoleDisplayName()}
                  </span>
                  {billingInfo?.subscriptionStatus === 'trial' && (
                    <span className="text-xs text-blue-400">
                      {billingInfo?.trialDaysLeft || 14} days left
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 font-medium mt-3"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
              >
                <Menu size={20} className="text-white" />
              </button>
              <h1 className="text-xl font-semibold text-white">
                {getCurrentPageName()}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-700">
                <Search size={20} className="text-white" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-700">
                <Bell size={20} className="text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Dock */}
      {dockVisible && <Dock />}
    </div>
  );
};

export default AppShell; 