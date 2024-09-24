# Microservices API

This project is a simple microservices API that consists of three services: Product Service, Customer Service, and Order Service. Each service handles its own data and communicates through HTTP requests.

## Table of Contents
- [Getting Started](#getting-started)
- [Services Overview](#services-overview)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Running the Services](#running-the-services)
- [Testing the API](#testing-the-api)
- [Contributing](#contributing)

## Getting Started

### Prerequisites
- Node.js (version 12 or higher)
- npm (Node Package Manager)

## Services Overview
1. **Product Service**: Manages product-related data.
2. **Customer Service**: Manages customer-related data.
3. **Order Service**: Manages orders and verifies customers and products.

## API Endpoints

### Product Service (Port 3001)
- **POST /products**: Add a new product.
- **GET /products/:productId**: Get product details by ID.
- **PUT /products/:productId**: Update a product.
- **DELETE /products/:productId**: Delete a product.

### Customer Service (Port 3002)
- **POST /customers**: Add a new customer.
- **GET /customers/:customerId**: Get customer details by ID.
- **PUT /customers/:customerId**: Update customer information.
- **DELETE /customers/:customerId**: Delete a customer.

### Order Service (Port 3003)
- **POST /orders**: Create a new order.
- **GET /orders/:orderId**: Get order details.
- **PUT /orders/:orderId**: Update an order.
- **DELETE /orders/:orderId**: Delete an order.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/[username]/3105_MICROSERVICE_API.git


Install dependencies for each service:

For Product Service:

cd product-service
npm install


For Customer Service:

cd ../customer-service
npm install

For Order Service:

cd ../order-service
npm install


Running the Services

Open three terminal windows or tabs.
In the first terminal, navigate to the Product Service and start it:

cd product-service
node index.js

In the second terminal, navigate to the Customer Service and start it:

cd customer-service
node index.js

In the third terminal, navigate to the Order Service and start it:

cd order-service
node index.js

Testing the API
You can use Postman or any other API testing tool to test the endpoints. Here are some sample requests:

Testing the Product Service

Add a New Product:
Method: POST
URL: http://localhost:3001/products
Body: { "name": "Product 1", "price": 100 }

Testing the Customer Service
Add a New Customer:
Method: POST
URL: http://localhost:3002/customers
Body: { "name": "Customer 1", "email": "customer1@example.com" }

Testing the Order Service
Create a New Order:
Method: POST
URL: http://localhost:3003/orders
Body: { "customerId": 1, "productId": 1 }
