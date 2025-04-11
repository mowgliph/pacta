const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
        console.error("JWT Verification Error:", err.message);
        return res.sendStatus(403); // Forbidden si el token es inválido/expirado
    }
    req.user = user; // user contiene { id, role } del payload del token
    next();
  });
};

const authorizeRole = (roles) => {
  // Asegurarse que roles sea siempre un array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    // Asegurarse que req.user exista (debe ejecutarse después de authenticateJWT)
    if (!req.user || !req.user.role) {
        console.warn('authorizeRole llamado sin req.user o req.user.role');
        return res.sendStatus(403); // Forbidden
    }

    if (!allowedRoles.includes(req.user.role)) {
        // El rol del usuario no está en la lista de roles permitidos
        return res.sendStatus(403); // Forbidden
    }
    next(); // El usuario tiene uno de los roles permitidos
  };
};

module.exports = { authenticateJWT, authorizeRole };