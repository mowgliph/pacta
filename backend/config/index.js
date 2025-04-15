require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-development-only',
        expiresIn: '1h'
    },
    upload: {
        path: process.env.UPLOAD_PATH || 'data/uploads',
        maxSize: 10 * 1024 * 1024 // 10MB
    },
    db: {
        url: process.env.DATABASE_URL
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    }
};