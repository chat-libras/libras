import { createContext, useContext, useState } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { darkTheme, lightTheme, type Theme } from './themes.ts';
import { GlobalStyle } from './GlobalStyle.ts';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  toggleTheme: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  const toggleTheme = () =>
    setTheme((t) => (t.name === 'dark' ? lightTheme : darkTheme));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <SCThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </SCThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
