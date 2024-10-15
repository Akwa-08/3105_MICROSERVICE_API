const express = require('express');
const app = express();
app.use(express.json());

let products = [];

// Create a new product
app.post('/products', (req, res) => {
  const product = { id: products.length + 1, ...req.body };
  products.push(product);
  res.status(201).json(product);
});

// Get product details by ID
app.get('/products/:productId', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.productId));
  if (!product) return res.status(404).send('Product not found.');
  res.json(product);
});

// Update product by ID
app.put('/products/:productId', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.productId));
  if (!product) return res.status(404).send('Product not found.');
  Object.assign(product, req.body);
  res.json(product);
});

// Delete a product by ID
app.delete('/products/:productId', (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.productId));
  if (productIndex === -1) return res.status(404).send('Product not found.');
  products.splice(productIndex, 1);
  res.status(204).send();
});

// Start the Product Service on port 3001
app.listen(3001, () => {
  console.log('Product Service is running on port 3001');
});
