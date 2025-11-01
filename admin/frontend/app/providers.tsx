'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import { ThemeProvider } from '../components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="listup-theme">
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </Provider>
  );
}

export default Providers;