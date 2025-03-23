import express from 'express';
import { UserRoute } from './UserRoute.js';
import config from '../config/app.config.js';

const router = express.Router();
const apiVersion = config.apiVersion || 'v1';

// Welcome route
router.get('/', (req, res) => {
  res.json({
    message: `Welcome to PACTA API ${apiVersion}`,
    version: apiVersion,
    documentation: `/api/${apiVersion}/docs`
  });
});

// Register routes with version prefix
const registerRoutes = () => {
  // User routes
  const userRoute = new UserRoute();
  router.use(`/${apiVersion}/users`, userRoute.getRouter());

  // TODO: Add other routes here
  // Example:
  // const contractRoute = new ContractRoute();
  // router.use(`/${apiVersion}/contracts`, contractRoute.getRouter());

  return router;
};

export default registerRoutes(); 