import React, { createContext, useContext, useState, useEffect } from 'react';
import { UiTheme } from '../types';

interface UiThemeContextType {
  uiTheme: UiTheme;
  setUiTheme: (theme: UiTheme) => void;
  toggleUiTheme: () => void;
  isDark: boolean;
}

const UiThemeContext = createContext<UiThemeContextType | undefined>(undefined);

export const UiThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiTheme, setUiThemeState] = useState<UiTheme>(() => {
    try {
      const saved = localStorage.getItem('flipbook_ui_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          return 'light';
        }
      }
    } catch {
      // localStorage unavailable or restricted
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('flipbook_ui_theme', uiTheme);
    } catch {
      // Storage error
    }

    const root = document.documentElement;
    if (uiTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-ui-theme', 'dark');
      document.body.setAttribute('data-ui-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      root.setAttribute('data-ui-theme', 'light');
      document.body.setAttribute('data-ui-theme', 'light');
    }
  }, [uiTheme]);

  const toggleUiTheme = () => {
    setUiThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setUiTheme = (theme: UiTheme) => {
    setUiThemeState(theme);
  };

  return (
    <UiThemeContext.Provider
      value={{
        uiTheme,
        setUiTheme,
        toggleUiTheme,
        isDark: uiTheme === 'dark',
      }}
    >
      {children}
    </UiThemeContext.Provider>
  );
};

export const useUiTheme = (): UiThemeContextType => {
  const context = useContext(UiThemeContext);
  if (!context) {
    throw new Error('useUiTheme must be used within a UiThemeProvider');
  }
  return context;
};
