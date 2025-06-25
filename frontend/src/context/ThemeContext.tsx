import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
  theme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then default to light mode
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return false; // Default to light mode (white background)
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  const setTheme = (theme: string) => {
    setIsDarkMode(theme === 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        setTheme,
        theme: isDarkMode ? 'dark' : 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a ThemeProvider');
  }
  return context;
};
