const express = require('express');
const app = express();
app.use(express.json());

let customers = [];

// Create a new customer
app.post('/customers', (req, res) => {
  const customer = { id: customers.length + 1, ...req.body };
  customers.push(customer);
  res.status(201).json(customer);
});

// Get customer details by ID
app.get('/customers/:customerId', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.customerId));
  if (!customer) return res.status(404).send('Customer not found.');
  res.json(customer);
});

// Update customer by ID
app.put('/customers/:customerId', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.customerId));
  if (!customer) return res.status(404).send('Customer not found.');
  Object.assign(customer, req.body);
  res.json(customer);
});

// Delete a customer by ID
app.delete('/customers/:customerId', (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.customerId));
  if (customerIndex === -1) return res.status(404).send('Customer not found.');
  customers.splice(customerIndex, 1);
  res.status(204).send();
});

// Start the Customer Service on port 3002
app.listen(3002, () => {
  console.log('Customer Service is running on port 3002');
});
