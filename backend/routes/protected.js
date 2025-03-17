import { Router } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { User, Contract, License } from '../models/associations.js';

const router = Router();

// Protected routes for all authenticated users
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin only routes
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Contract management routes
router.get('/contracts', verifyToken, async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// License management routes
router.get('/licenses', verifyToken, isAdmin, async (req, res) => {
  try {
    const licenses = await License.findAll();
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;