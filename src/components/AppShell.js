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
  Clock,
  FileText,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../lib/supabaseService';
import Dock from './Dock';
import Logo from './Logo';

const AppShell = ({ children }) => {
  const { user, signOut, isAdmin, isMember, isManager, isLeader, isMasterAccount, billingInfo } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const [storage, setStorage] = useState({
    used: 0,
    limit: 0,
    percentage: 0
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Teams', icon: Users, path: '/teams' },
        { name: 'Surveys', icon: BarChart3, path: '/surveys' },
        { name: 'Billing', icon: CreditCard, path: '/billing' },
        { name: 'Settings', icon: Settings, path: '/settings' }
      ];
    } else if (isManager) {
      return [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Surveys', icon: BarChart3, path: '/surveys' },
        { name: 'Settings', icon: Settings, path: '/settings' }
      ];
    } else if (isLeader) {
      return [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Surveys', icon: BarChart3, path: '/surveys' },
        { name: 'Settings', icon: Settings, path: '/settings' }
      ];
    } else if (isMember) {
      return [
        { name: 'My Surveys', icon: BarChart3, path: '/surveys' },
        { name: 'Profile', icon: User, path: '/profile' }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  // Calculate storage usage
  const calculateStorageUsage = (members) => {
    const baseStorage = 0.2; // 200MB base storage
    const perMemberStorage = 0.1; // 100MB per member
    const perMeetingStorage = 0.05; // 50MB per meeting recording
    const perSurveyStorage = 0.01; // 10MB per survey response
    
    const memberCount = members.length;
    const estimatedMeetings = memberCount * 2; // Assume 2 meetings per member
    const estimatedSurveys = memberCount * 3; // Assume 3 surveys per member
    
    const usedStorage = baseStorage + 
      (memberCount * perMemberStorage) + 
      (estimatedMeetings * perMeetingStorage) + 
      (estimatedSurveys * perSurveyStorage);
    
    // Calculate storage limit (1GB base + 1GB per member)
    const storageLimit = 1 + memberCount;
    
    const percentage = Math.min((usedStorage / storageLimit) * 100, 100);
    
    return {
      used: Math.round(usedStorage * 100) / 100,
      limit: storageLimit,
      percentage: Math.round(percentage * 100) / 100
    };
  };

  // Load storage data
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const { data: members } = await teamService.getTeamMembers();
        const storageData = calculateStorageUsage(members || []);
        setStorage(storageData);
      } catch (error) {
        console.error('Error loading storage data:', error);
      }
    };

    if (user) {
      loadStorageData();
    }
  }, [user]);

  const getCurrentPageName = () => {
    const navigationItems = getNavigationItems();
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  const handleSignOut = async () => {
    try {
      console.log('AppShell: Starting sign out...');
      const { error } = await signOut();
      
      if (error) {
        console.error('AppShell: Sign out error:', error);
        // Still try to navigate to login page even if there's an error
        navigate('/');
        return;
      }
      
      console.log('AppShell: Sign out successful, navigating to login...');
      // Force navigation to login page
      window.location.href = '/';
    } catch (error) {
      console.error('AppShell: Unexpected error during sign out:', error);
      // Fallback navigation
      window.location.href = '/';
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

  const getPlanStatus = () => {
    if (isMasterAccount) {
      return (
        <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
          <Crown size={10} />
          <span>Master Plan</span>
        </div>
      );
    }
    const plan = billingInfo.plan || 'basic';
    return (
      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
          <div className="flex items-center justify-center p-6 border-b border-white/10">
            <Link to="/dashboard" className="flex items-center justify-center">
              <Logo size="xl" />
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
            <Link
              to="/settings"
              className="flex items-center gap-3 p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  My Account
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/50">
                    {getRoleDisplayName()}
                  </span>
                  {billingInfo?.subscriptionStatus === 'trial' && (
                    <span className="text-xs text-blue-400">
                      {billingInfo?.trialDaysLeft || 14} days left
                    </span>
                  )}
                </div>
                {/* Storage indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <HardDrive size={12} className="text-white/40" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/50">Storage</span>
                      <span className="text-xs text-white/60">
                        {storage.used}GB / {storage.limit}GB
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          storage.percentage >= 90 
                            ? 'bg-red-400' 
                            : storage.percentage >= 75 
                              ? 'bg-orange-400' 
                              : 'bg-green-400'
                        }`}
                        style={{ width: `${storage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium mt-3"
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
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              >
                <Menu size={20} className="text-white" />
              </button>
              <h1 className="text-xl font-semibold text-white">
                {getCurrentPageName()}
              </h1>
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