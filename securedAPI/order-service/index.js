const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan'); // Importing morgan for logging

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined')); // Logging all requests

const orders = []; // In-memory order database

// Middleware to validate JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log(`Unauthorized request from IP: ${req.ip} - Token missing`); // Log token missing
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(`Invalid or expired token for IP: ${req.ip}, Error: ${err.message}`); // Log token error
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to restrict actions to specific roles
const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    console.log(`Access denied for user ${req.user.id}, role: ${req.user.role} - Required role: ${role}`); // Log role violation
    return res.status(403).json({ message: `Access denied: ${role} role required` });
  }
  next();
};

// Create an order (Only customers can place orders)
app.post('/orders', authenticateToken, authorizeRole('customer'), async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Verify the user exists (calling User Service)
    const userResponse = await axios.get(`https://localhost:3001/users/${userId}`, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    if (userResponse.status !== 200) {
      console.log(`User not found: ${userId}`); // Log user not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the product exists (calling Product Service)
    const productResponse = await axios.get(`https://localhost:3002/products/${productId}`, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    if (productResponse.status !== 200) {
      console.log(`Product not found: ${productId}`); // Log product not found
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create and store the order
    const order = { id: Math.random(), userId, productId };
    orders.push(order);
    console.log(`Order created: ID ${order.id}, User ${userId}, Product ${productId}`); // Log successful order creation
    res.status(201).json(order);

  } catch (error) {
    console.error(`Error processing order for user ${userId}:`, error.message); // Log any errors during order creation
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all orders (Only admins can view all orders)
app.get('/orders', authenticateToken, authorizeRole('admin'), (req, res) => {
  console.log(`Admin ${req.user.id} is fetching all orders`); // Log admin action
  res.json(orders);
});

// Get order by ID (Customer or admin can view)
app.get('/orders/:id', authenticateToken, (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (!order) {
    console.log(`Order not found: ID ${req.params.id}`); // Log order not found
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check if the user is allowed to view the order
  if (req.user.role !== 'admin' && req.user.id !== order.userId) {
    console.log(`Access denied for user ${req.user.id} to view order ${req.params.id}`); // Log unauthorized order access
    return res.status(403).json({ message: 'Access denied' });
  }

  console.log(`Order fetched: ID ${req.params.id}, by user ${req.user.id}`); // Log successful order retrieval
  res.json(order);
});

// Delete order (Only admins can delete)
app.delete('/orders/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const orderIndex = orders.findIndex(o => o.id == req.params.id);
  if (orderIndex === -1) {
    console.log(`Order not found for deletion: ID ${req.params.id}`); // Log order not found
    return res.status(404).json({ message: 'Order not found' });
  }

  orders.splice(orderIndex, 1);
  console.log(`Order deleted: ID ${req.params.id}, by admin ${req.user.id}`); // Log successful order deletion
  res.status(204).json({ message: 'Order deleted successfully' });
});

// HTTPS setup
const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem')
};

const PORT = process.env.PORT || 3003;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Order Service running on https://localhost:${PORT}`);
});
