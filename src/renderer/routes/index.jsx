import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import useStore from '@/renderer/store/useStore';
import PublicLayout from '@/renderer/layouts/PublicLayout';
import PrivateLayout from '@/renderer/layouts/PrivateLayout';
import { 
  Public, 
  Auth, 
  Dashboard, 
  ContractManagement,
  ContractDetails,
  AdvancedStatistics,
  Profile 
} from '@/renderer/pages';

// Componente de ruta privada con verificación de autenticación
const PrivateRoute = ({ component: Component, roles = [], ...rest }) => {
  const { user } = useStore();

  return (
    <Route
      {...rest}
      render={props => {
        // Verificar si el usuario está autenticado
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Verificar si el usuario tiene el rol requerido
        if (roles.length && !roles.includes(user.role)) {
          return <Redirect to="/dashboard" />;
        }

        // Autorizado - renderizar componente
        return (
          <PrivateLayout>
            <Component {...props} />
          </PrivateLayout>
        );
      }}
    />
  );
};

// Componente de ruta pública
const PublicRoute = ({ component: Component, restricted = false, ...rest }) => {
  const { user } = useStore();

  return (
    <Route
      {...rest}
      render={props => {
        // Verificar si la ruta es restringida y el usuario está autenticado
        if (restricted && user) {
          return <Redirect to="/dashboard" />;
        }

        return (
          <PublicLayout>
            <Component {...props} />
          </PublicLayout>
        );
      }}
    />
  );
};

const Routes = () => {
  return (
    <Switch>
      {/* Rutas Públicas */}
      <PublicRoute exact path="/" component={Public} />
      <PublicRoute path="/auth" component={Auth} restricted={true} />

      {/* Rutas Privadas */}
      <PrivateRoute path="/dashboard" component={Dashboard} />
      <PrivateRoute 
        path="/contracts" 
        component={ContractManagement} 
        roles={['Admin', 'RA']} 
      />
      <PrivateRoute 
        path="/contracts/:id" 
        component={ContractDetails} 
        roles={['Admin', 'RA']} 
      />
      <PrivateRoute 
        path="/statistics" 
        component={AdvancedStatistics} 
        roles={['Admin', 'RA']} 
      />
      <PrivateRoute path="/profile" component={Profile} />

      {/* Ruta 404 */}
      <Route>
        <div role="alert" aria-label="Página no encontrada">
          <h1>404 - Página no encontrada</h1>
          <p>Lo sentimos, la página que buscas no existe.</p>
        </div>
      </Route>
    </Switch>
  );
};

export default Routes; 