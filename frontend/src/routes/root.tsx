import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { AuthProvider } from '@/features/auth/components/AuthProvider';

export function Root() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
} 