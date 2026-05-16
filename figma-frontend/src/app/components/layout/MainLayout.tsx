import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside it (on mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('sidebar-mobile');
        const hamburger = document.getElementById('hamburger-btn');
        if (sidebar && !sidebar.contains(e.target as Node) && !hamburger?.contains(e.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - responsive */}
      <div
        id="sidebar-mobile"
        className={`fixed lg:relative z-50 h-full transform transition-transform duration-300 ${
          isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
