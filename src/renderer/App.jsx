import React from 'react';
import { Router, Route, Switch, Redirect } from 'wouter';
import useStore from '@/renderer/store/useStore';
import Public from './pages/public';
import Dashboard from './pages/dashboard';
import Auth from './pages/auth';
import ContractManagement from './pages/contracts/contractManagement';
import AdvancedStatistics from './pages/advancedStatistics';
import UserProfile from './pages/userProfile';
import ContractForm from './pages/contracts/contractForm';
import ContractDetails from './pages/contracts/contractDetails';
import { Toaster } from "@/renderer/components/ui/toaster"

// Componente para proteger rutas
const PrivateRoute = ({ component: Component, ...rest }) => {
  const user = useStore((state) => state.user);

  return (
    <Route {...rest}>
      {user ? <Component /> : <Redirect to="/auth" />}
    </Route>
  );
};

const App = () => {
  const user = useStore((state) => state.user);

  return (
    <React.Fragment>
      {/* Usa Switch para renderizar solo la primera ruta que coincida */}
      <Router>
        <Switch>
          <Route path="/" component={Public} />
          <Route path="/auth">
            {/* Si el usuario ya está autenticado, redirige al dashboard */}
            {user ? <Redirect to="/dashboard" /> : <Auth />}
          </Route>

          {/* Rutas Privadas */}
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <PrivateRoute path="/contracts" component={ContractManagement} />
          <PrivateRoute path="/contracts/new" component={ContractForm} />
          <PrivateRoute path="/contracts/:id/edit" component={ContractForm} />
          <PrivateRoute path="/contracts/:id" component={ContractDetails} />
          <PrivateRoute path="/statistics" component={AdvancedStatistics} />
          <PrivateRoute path="/profile" component={UserProfile} />

          {/* Redirección por defecto si ninguna ruta coincide (opcional) */}
          {/* Podrías redirigir a / o /dashboard dependiendo de si está logueado */}
          <Route>
            <Redirect to={user ? "/dashboard" : "/"} />
          </Route>
        </Switch>
      </Router>
      <Toaster />
    </React.Fragment>
  );
};

export default App;