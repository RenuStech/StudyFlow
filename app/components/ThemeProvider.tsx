
'use client';

import { useEffect } from 'react';

export default function ThemeProvider() {
  useEffect(() => {
    const applyTheme = () => {
      const enabled =
        localStorage.getItem('studyflow_dark_mode') === 'true';

      document.documentElement.classList.toggle('dark', enabled);
      document.body.classList.toggle('dark', enabled);
    };

    applyTheme();

    window.addEventListener('studyflow-theme-change', applyTheme);
    window.addEventListener('storage', applyTheme);

    return () => {
      window.removeEventListener('studyflow-theme-change', applyTheme);
      window.removeEventListener('storage', applyTheme);
    };
  }, []);

  return null;
}
