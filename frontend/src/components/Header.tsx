import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { authService } from '../services/auth.ts';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const data = await authService.getDashboardGreeting();
        setGreeting(data.greeting);
      } catch (error) {
        // Fallback greeting
        const hour = new Date().getHours();
        const timeGreeting = 
          hour < 12 ? 'Good Morning' : 
          hour < 17 ? 'Good Afternoon' : 
          'Good Evening';
        setGreeting(`${timeGreeting}, ${user?.first_name || 'User'}!`);
      }
    };

    if (user) {
      fetchGreeting();
    }
  }, [user]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="w-6 h-6" />
            </button>

            {/* Greeting */}
            <div className="ml-4 lg:ml-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {greeting}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                What do you plan to do today?
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* User info and avatar */}
            {user && (
              <div className="flex items-center space-x-3">
                {/* User avatar and info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      1,354 pts
                    </p>
                  </div>
                  
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    {/* Status icons */}
                    <div className="absolute -top-1 -right-1 flex space-x-1">
                      <span className="inline-block w-3 h-3 text-xs">🥳</span>
                      <span className="inline-block w-3 h-3 text-xs">😊</span>
                      <span className="inline-block w-3 h-3 text-xs">😠</span>
                      <span className="inline-block w-3 h-3 text-xs">😈</span>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <Bell className="w-5 h-5" />
                </button>

                {/* Settings */}
                <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
