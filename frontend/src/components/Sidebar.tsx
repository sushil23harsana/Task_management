import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  CheckSquare,
  BarChart3,
  Calendar,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Share,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  
  const navigation = [
    {
      name: 'To-do',
      href: '/dashboard',
      icon: CheckSquare,
      current: location.pathname.startsWith('/dashboard'),
    },
    {
      name: 'Share My Impact',
      href: '/share',
      icon: Share,
      current: location.pathname.startsWith('/share'),
      badge: 'OFF'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: location.pathname.startsWith('/analytics'),
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: location.pathname.startsWith('/calendar'),
    },
  ];

  const projects = [
    { name: 'Odama Website', icon: '🔥', color: 'text-orange-500' },
    { name: 'Dribbble', icon: '🏀', color: 'text-pink-500' },
  ];

  const personalProjects = [
    { name: 'Personal Project', icon: '📝', color: 'text-blue-500' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                BetterTasks
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-2">
              {/* Main Menu */}
              <div className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Main Menu
                </h3>                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `sidebar-item ${isActive ? 'active' : ''} text-gray-700 dark:text-gray-300 flex items-center justify-between`
                      }
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                      {item.badge && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              {/* Projects */}
              <div className="mb-6">
                <div className="flex items-center justify-between px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Projects
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="text-lg">+</span>
                  </button>
                </div>
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className="sidebar-item text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <span className="mr-3 text-lg">{project.icon}</span>
                    {project.name}
                  </div>
                ))}
              </div>

              {/* Personal Projects */}
              <div className="mb-6">
                <div className="flex items-center justify-between px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Personal Project
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <span className="text-lg">+</span>
                  </button>
                </div>
                {personalProjects.map((project) => (
                  <div
                    key={project.name}
                    className="sidebar-item text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <span className="mr-3 text-lg">{project.icon}</span>
                    {project.name}
                  </div>
                ))}
              </div>
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-full sidebar-item text-gray-700 dark:text-gray-300 mb-2"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 mr-3" />
                ) : (
                  <Moon className="w-5 h-5 mr-3" />
                )}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              {/* User section */}
              {user && (
                <div className="space-y-2">
                  <div className="sidebar-item text-gray-700 dark:text-gray-300">
                    <User className="w-5 h-5 mr-3" />
                    {user.first_name} {user.last_name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full sidebar-item text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              )}              {/* Upgrade section */}
              <div className="mt-4 p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg text-white">
                <div className="flex items-center mb-2">
                  <Settings className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Upgrade plan</span>
                </div>
                <p className="text-sm text-primary-100 mb-3">
                  Unlock your personal to-do workspace, share your impact with multiple people and much more
                </p>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
