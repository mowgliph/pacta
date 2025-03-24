import express from 'express';
import userRoutes from './userRoutes.js';
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
  router.use(`/${apiVersion}/users`, userRoutes);

  // TODO: Add other routes here
  // Example:
  // const contractRoute = new ContractRoute();
  // router.use(`/${apiVersion}/contracts`, contractRoute.getRouter());

  return router;
};

export default registerRoutes(); 