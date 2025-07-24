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
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Dock from './Dock';

const AppShell = ({ children }) => {
  const { user, signOut, isAdmin, isMember } = useAuth();
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

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-glass-sidebar backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/app/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-mint to-mint-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-mint to-mint-dark bg-clip-text text-transparent">
                LauAI
              </span>
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
                      ? 'bg-mint text-black font-medium' 
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-mint-accent rounded-full flex items-center justify-center">
                <span className="text-mint-dark font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-white/60 capitalize">
                  {isAdmin ? 'Administrator' : 'Team Member'}
                </p>
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
        <header className="bg-glass-topnav backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              >
                <Menu size={20} className="text-white" />
              </button>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-mint/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-white/10 relative">
                <Bell size={20} className="text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="w-8 h-8 bg-mint-accent rounded-full flex items-center justify-center">
                  <span className="text-mint-dark font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-white/60 capitalize">
                    {isAdmin ? 'Administrator' : 'Team Member'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Dock - Only show for admins */}
      {isAdmin && dockVisible && <Dock />}
    </div>
  );
};

export default AppShell; 