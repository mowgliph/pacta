import React from 'react';
import { Router } from 'wouter';
import Public from './pages/public';
import Dashboard from './pages/dashboard';
import Auth from './pages/auth';
import ContractManagement from './pages/contracts/contractManagement';
import AdvancedStatistics from './pages/advancedStatistics';
import UserProfile from './pages/userProfile';
import { Toaster } from "@/renderer/components/ui/toaster"

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Public path="/" />
        <Auth path="/auth" />
        <Dashboard path="/dashboard" />
        <ContractManagement path="/contracts" />
        <AdvancedStatistics path="/statistics" />
        <UserProfile path="/profile" />
      </Router>
      <Toaster />
    </React.Fragment>
  );
};

export default App;