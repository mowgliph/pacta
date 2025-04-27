const jwt = require("jsonwebtoken")
const config = require("../config")

/**
 * Middleware para verificar la autenticación del usuario mediante token JWT
 * Actualizado para trabajar con Prisma
 */
module.exports = (req, res, next) => {
  // Obtener token del header
  const token = req.header("x-auth-token")

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "No hay token, autenticación denegada" 
    })
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // Añadir usuario a request
    req.user = decoded.user
    next()
  } catch (error) {
    console.error("Error en middleware de autenticación:", error)
    
    // Tipos específicos de error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expirado", 
        error: "token_expired" 
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token inválido", 
        error: "invalid_token" 
      })
    }
    
    res.status(401).json({ 
      success: false, 
      message: "Token no válido" 
    })
  }
}
