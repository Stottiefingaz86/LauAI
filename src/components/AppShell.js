import React, { useState, useEffect } from 'react';
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
  Star,
  Clock
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
        { name: 'Dashboard', icon: Home, path: '/app/dashboard' },
        { name: 'Teams', icon: Users, path: '/app/teams' },
        { name: 'Surveys', icon: BarChart3, path: '/app/surveys' },
        { name: 'Billing', icon: CreditCard, path: '/app/billing' },
        { name: 'Settings', icon: Settings, path: '/app/settings' }
      ];
    } else if (isManager) {
      return [
        { name: 'Dashboard', icon: Home, path: '/app/dashboard' },
        { name: 'Surveys', icon: BarChart3, path: '/app/surveys' },
        { name: 'Settings', icon: Settings, path: '/app/settings' }
      ];
    } else if (isLeader) {
      return [
        { name: 'Dashboard', icon: Home, path: '/app/dashboard' },
        { name: 'Surveys', icon: BarChart3, path: '/app/surveys' },
        { name: 'Settings', icon: Settings, path: '/app/settings' }
      ];
    } else if (isMember) {
      return [
        { name: 'My Surveys', icon: BarChart3, path: '/app/surveys' },
        { name: 'Profile', icon: User, path: '/app/profile' }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Hide dock when modals are open
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const hasModal = document.querySelector('.fixed.inset-0.bg-black\\/50');
          setDockVisible(!hasModal);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  // Hide dock on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateDockVisibility = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setDockVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        // Scrolling up or at top
        setDockVisible(true);
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateDockVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs">
          <Crown size={10} />
          <span>Master</span>
        </div>
      );
    }
    if (isAdmin) {
      return (
        <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          <Shield size={10} />
          <span>Admin</span>
        </div>
      );
    }
    if (isManager) {
      return (
        <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          <Users size={10} />
          <span>Manager</span>
        </div>
      );
    }
    if (isLeader) {
      return (
        <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
          <Star size={10} />
          <span>Leader</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
        <User size={10} />
        <span>Member</span>
      </div>
    );
  };

  const getPlanStatus = () => {
    if (isMasterAccount) {
      return (
        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs">
          <Crown size={10} />
          <span>Master Plan</span>
        </div>
      );
    }
    const plan = billingInfo.plan || 'basic';
    return (
      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
        <Star size={10} />
        <span className="capitalize">{plan} Plan</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/app/dashboard" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
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
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 font-medium' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
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
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'User'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge()}
                  {getPlanStatus()}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              >
                <Menu size={20} className="text-white" />
              </button>
              <Logo size="sm" showText={false} />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-white/10">
                <Search size={20} className="text-white" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10">
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