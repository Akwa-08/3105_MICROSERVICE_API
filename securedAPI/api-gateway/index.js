const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const cors = require('cors');


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes to Product Service
app.use('/products', authenticateToken, createProxyMiddleware({
  target: 'https://localhost:3002',
  changeOrigin: true,
  secure: false // for self-signed certificates
}));

// Routes to User Service
app.use('/users', createProxyMiddleware({
  target: 'https://localhost:3001',
  changeOrigin: true,
  secure: false
}));

// Routes to Order Service
app.use('/orders', authenticateToken, createProxyMiddleware({
  target: 'https://localhost:3003',
  changeOrigin: true,
  secure: false
}));

// HTTPS setup
const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem')
};

const PORT = process.env.PORT || 3000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`API Gateway running on https://localhost:${PORT}`);
});
