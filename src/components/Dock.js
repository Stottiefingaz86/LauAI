import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Upload, 
  Share2
} from 'lucide-react';
import InviteModal from './InviteModal';

const Dock = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const dockItems = [
    { 
      icon: <Plus className="w-5 h-5" />, 
      label: 'Add Team Member', 
      description: 'Add new team member to your organization',
      onClick: () => window.location.href = '/teams',
      color: 'from-blue-400 to-cyan-400'
    },
    { 
      icon: <FileText className="w-5 h-5" />, 
      label: 'Create Survey', 
      description: 'Create a new team survey',
      onClick: () => window.location.href = '/surveys',
      color: 'from-green-400 to-emerald-400'
    },
    { 
      icon: <Upload className="w-5 h-5" />, 
      label: 'Upload 1:1', 
      description: 'Upload 1:1 meeting notes for analysis',
      onClick: () => window.location.href = '/entry',
      color: 'from-purple-400 to-pink-400'
    },
    { 
      icon: <Share2 className="w-5 h-5" />, 
      label: 'Invite', 
      description: 'Invite team members to SignalOS',
      onClick: () => setShowInviteModal(true),
      color: 'from-orange-400 to-red-400'
    }
  ];

  // Check for modals
  useEffect(() => {
    const checkForModals = () => {
      const modals = document.querySelectorAll('[class*="fixed inset-0 bg-black/50"]');
      const hasModal = modals.length > 0;
      setIsModalOpen(hasModal);
    };

    // Check immediately
    checkForModals();

    // Set up observer for modal changes
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Scroll detection
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Only respond to significant scroll movements
      if (Math.abs(scrollDelta) > 5) {
        if (scrollDelta > 0) {
          // Scrolling down - hide dock
          setIsVisible(false);
        } else {
          // Scrolling up - show dock
          setIsVisible(true);
        }
      }
      
      lastScrollY = currentScrollY;

      // Show dock after scrolling stops (only if scrolling up)
      if (scrollDelta < 0) {
        scrollTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Don't render if modal is open
  if (isModalOpen) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="glass-card px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center space-x-4">
          {dockItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={index}
                className="relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-out group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={item.onClick}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="px-4 py-2 rounded-xl text-sm text-white whitespace-nowrap border border-white/20 shadow-xl backdrop-blur-2xl bg-black/80">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-white/70 text-xs mt-1">{item.description}</div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                  </div>
                )}

                {/* Dock Item */}
                <div 
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isHovered 
                      ? 'scale-105 shadow-lg bg-gradient-to-r ' + item.color + ' shadow-lg' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className={`transition-all duration-300 ${
                    isHovered ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {item.icon}
                  </div>
                </div>


              </div>
            );
          })}
        </div>
      </div>
      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  );
};

export default Dock; 