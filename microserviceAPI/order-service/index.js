const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3003;

app.use(express.json()); // Middleware to parse JSON bodies

// In-memory storage for orders (for demonstration purposes)
let orders = [];

// Create a new order
app.post('/orders', async (req, res) => {
    const { customerId, productId } = req.body;

    try {
        // Validate customer
        const customerResponse = await axios.get(`http://localhost:3002/customers/${customerId}`);
        // Validate product
        const productResponse = await axios.get(`http://localhost:3001/products/${productId}`);

        // If both exist, create the order
        const newOrder = { id: orders.length + 1, customerId, productId, status: 'Pending' };
        orders.push(newOrder); // Store the order in memory

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error.message);

        if (error.response) {
            // Handle errors from the other services
            if (error.response.status === 404) {
                return res.status(404).send('Customer or product not found');
            }
        }
        res.status(500).send('An error occurred while creating the order');
    }
});

// Get order details
app.get('/orders/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        return res.status(404).send('Order not found');
    }

    res.json(order);
});

// Update an order
app.put('/orders/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        return res.status(404).send('Order not found');
    }

    const { status } = req.body;
    order.status = status || order.status; // Update status if provided

    res.json(order);
});

// Delete an order
app.delete('/orders/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
        return res.status(404).send('Order not found');
    }

    orders.splice(orderIndex, 1); // Remove the order from the array
    res.status(204).send(); // No content to return
});

// Start the server
app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
