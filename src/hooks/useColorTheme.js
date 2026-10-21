import { useState, useEffect } from 'react';
import { readStoredColorTheme, saveColorTheme } from '../utils/colorTheme';

export function useColorTheme() {
  const [colorTheme, setColorTheme] = useState(readStoredColorTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = colorTheme;
    saveColorTheme(colorTheme);
  }, [colorTheme]);

  return { colorTheme, setColorTheme };
}
