import React from 'react';
import { Route, Switch, Redirect } from 'wouter';
import useStore from '@/renderer/store/useStore';
import PublicLayout from '@/renderer/layouts/PublicLayout';
import PrivateLayout from '@/renderer/layouts/PrivateLayout';
import NotFound from '@/renderer/components/NotFound';
import { 
  Public, 
  Auth, 
  Dashboard, 
  ContractManagement,
  ContractDetails,
  AdvancedStatistics,
  useProfile,
  Settings
} from '@/renderer/pages/index';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  roles?: string[];
  path: string;
  [key: string]: any;
}

interface PublicRouteProps {
  component: React.ComponentType<any>;
  restricted?: boolean;
  path: string;
  exact?: boolean;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, roles = [], ...rest }) => {
  const { user } = useStore();

  return (
    <Route {...rest}>
      {(params) => {
        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (roles.length && !roles.includes(user.role)) {
          return <Redirect to="/dashboard" />;
        }

        return (
          <PrivateLayout>
            <Component {...params} />
          </PrivateLayout>
        );
      }}
    </Route>
  );
};

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, restricted = false, ...rest }) => {
  const { user } = useStore();

  return (
    <Route {...rest}>
      {(params) => {
        if (restricted && user) {
          return <Redirect to="/dashboard" />;
        }

        return (
          <PublicLayout>
            <Component {...params} />
          </PublicLayout>
        );
      }}
    </Route>
  );
};

const Routes: React.FC = () => {
  return (
    <Switch>
      <PublicRoute exact path="/" component={Public} />
      <PublicRoute path="/auth" component={Auth} restricted={true} />

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
      <PrivateRoute path="/profile" component={useProfile} />
      <PrivateRoute path="/settings" component={Settings} />

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Routes;