import express from 'express';
import jwt from 'jsonwebtoken';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'Se requiere un token para autenticación' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * GET /analytics
 * Obtiene los datos completos para el dashboard de analytics
 */
router.get('/', verifyToken, analyticsController.getAnalyticsData);

/**
 * GET /analytics/historical
 * Obtiene datos históricos con granularidad personalizada
 */
router.get('/historical', verifyToken, analyticsController.getHistoricalData);

/**
 * GET /analytics/report/:format
 * Genera y devuelve un reporte exportable en el formato especificado
 */
router.get('/report/:format', verifyToken, analyticsController.generateReport);

/**
 * GET /analytics/risk-contracts
 * Obtiene la lista de contratos en riesgo para la tabla de analíticas
 */
router.get('/risk-contracts', verifyToken, analyticsController.getRiskContracts);

/**
 * GET /analytics/:analysisType
 * Obtiene datos para un tipo específico de análisis
 */
router.get('/:analysisType', verifyToken, analyticsController.getSpecificAnalysis);

export default router; 