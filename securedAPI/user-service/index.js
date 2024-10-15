const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const rateLimit = require('express-rate-limit');  // Import rate limiter
const morgan = require('morgan');  // Import morgan for logging

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('combined')); // Log all requests in the 'combined' format (includes status codes, errors, etc.)

const users = []; // Sample in-memory users database

// Apply a rate limit to the login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  onLimitReached: (req, res, options) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);  // Log when rate limit is hit
  }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log(`Unauthorized request from IP: ${req.ip}`);  // Log unauthorized request
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(`Forbidden request from IP: ${req.ip}, Error: ${err.message}`);  // Log forbidden request
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Only admin can perform certain actions
const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    console.log(`Access denied for user ${req.user.id}, role: ${req.user.role}`);  // Log access denial
    return res.sendStatus(403);
  }
  next();
};

// Register route
app.post('/users/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // Include role in the request body
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role to 'customer' if not provided
    const userRole = role || 'customer';

    const user = { id: users.length + 1, username, email, password: hashedPassword, role: userRole };
    users.push(user);
    console.log(`User registered: ${username} with role: ${userRole}`);  // Log successful registration
    res.status(201).json(user);
  } catch (error) {
    console.error(`Error registering user: ${error.message}`);  // Log any errors during registration
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route with rate limiting
app.post('/users/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`User logged in: ${username}`);  // Log successful login
    res.json({ token });
  } else {
    console.log(`Failed login attempt for user: ${username}`);  // Log failed login attempt
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get user by ID
app.get('/users/:id', authenticateToken, (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) {
    console.log(`User not found: ID ${req.params.id}`);  // Log user not found
    return res.sendStatus(404);
  }
  res.json(user);
});

// Update user (Admin or the user themselves can update)
app.put('/users/:id', authenticateToken, (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) {
    console.log(`User not found: ID ${req.params.id}`);  // Log user not found
    return res.sendStatus(404);
  }
  if (req.user.id !== user.id && req.user.role !== 'admin') {
    console.log(`User ${req.user.id} not authorized to update user ${user.id}`);  // Log unauthorized update attempt
    return res.sendStatus(403);
  }
  const { username, email } = req.body;
  user.username = username || user.username;
  user.email = email || user.email;
  console.log(`User updated: ${user.id}`);  // Log successful update
  res.json(user);
});

// Delete user (Only admin can delete users)
app.delete('/users/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const userIndex = users.findIndex(u => u.id == req.params.id);
  if (userIndex === -1) {
    console.log(`User not found for deletion: ID ${req.params.id}`);  // Log user not found for deletion
    return res.sendStatus(404);
  }
  users.splice(userIndex, 1);
  console.log(`User deleted: ID ${req.params.id}`);  // Log successful deletion
  res.sendStatus(204);
});

// HTTPS setup
const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem')
};

app.use(cors());

const PORT = process.env.PORT || 3001;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`User Service running on https://localhost:${PORT}`);
});
