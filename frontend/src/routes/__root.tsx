import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { NotificationContainer } from '../components/layout/NotificationContainer';
import { useStore } from '../store';

// Root component which includes global providers and layouts
export const Route = createRootRoute({
  component: () => {
    // Verify session on app load
    const verifySession = useStore(state => state.verifySession);
    React.useEffect(() => {
      verifySession();
    }, [verifySession]);

    return (
      <>
        {/* Global notification container */}
        <NotificationContainer />
        
        {/* Child routes will be rendered here */}
        <Outlet />
      </>
    );
  },
}); 