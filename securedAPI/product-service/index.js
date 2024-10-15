const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan'); // Import morgan for logging

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined')); // Log all requests with status codes and other details

const products = []; // In-memory product database

// Middleware to validate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get the token from "Bearer <token>"

  if (!token) {
    console.log(`Access token missing for request from IP: ${req.ip}`); // Log missing token
    return res.status(401).json({ message: 'Access token missing' }); // 401 Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(`Invalid or expired token for request from IP: ${req.ip}, Error: ${err.message}`); // Log token issues
      return res.status(403).json({ message: 'Invalid or expired token' }); // 403 Forbidden
    }
    req.user = user;
    next();
  });
};

// Middleware to restrict actions to specific roles
const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    console.log(`Access denied for user ${req.user.id}, required role: ${role}`); // Log access denial
    return res.status(403).json({ message: `Access denied: ${role} role required` }); // 403 Forbidden
  }
  next();
};

// Add product (Only admin can add)
app.post('/products', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    console.log(`Product creation failed: Missing name or price in request from IP: ${req.ip}`); // Log failed creation
    return res.status(400).json({ message: 'Product name and price are required' }); // 400 Bad Request
  }

  const product = { id: products.length + 1, name, price };
  products.push(product);
  console.log(`Product added: ${name}, Price: ${price}`); // Log product creation
  res.status(201).json(product);
});

// Get product by ID (Anyone with a valid token)
app.get('/products/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) {
    console.log(`Product not found: ID ${req.params.id} requested by user ${req.user.id}`); // Log not found product
    return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
  }
  res.json(product);
});

// Update product (Only admin can update)
app.put('/products/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (!product) {
    console.log(`Product not found for update: ID ${req.params.id} by user ${req.user.id}`); // Log product not found for update
    return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
  }

  const { name, price } = req.body;
  if (name) product.name = name;
  if (price) product.price = price;

  console.log(`Product updated: ID ${product.id}, Name: ${name}, Price: ${price}`); // Log successful update
  res.json({ message: 'Product updated successfully', product });
});

// Delete product (Only admin can delete)
app.delete('/products/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const productIndex = products.findIndex(p => p.id == req.params.id);
  if (productIndex === -1) {
    console.log(`Product not found for deletion: ID ${req.params.id}`); // Log product not found for deletion
    return res.status(404).json({ message: 'Product not found' }); // 404 Not Found
  }

  products.splice(productIndex, 1);
  console.log(`Product deleted: ID ${req.params.id}`); // Log successful deletion
  res.status(204).json({ message: 'Product deleted successfully' });
});

// HTTPS setup
const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem')
};

const PORT = process.env.PORT || 3002;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Product Service running on https://localhost:${PORT}`);
});
