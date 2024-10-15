Here’s the updated **README.md** file that includes installation instructions for the API Gateway along with the three services. 

---

# Secured Microservices API

This project is a secured microservices-based API with four components: **API Gateway**, **Product Service**, **User Service**, and **Order Service**. Each service handles its own data and communicates via HTTP requests. The services are secured using JWT-based authentication and role-based access control (RBAC).

## Table of Contents
- [Secured Microservices API](#secured-microservices-api)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [API Gateway:](#api-gateway)
      - [Product Service:](#product-service)
      - [User Service:](#user-service)
      - [Order Service:](#order-service)
  - [Services Overview](#services-overview)
  - [API Endpoints](#api-endpoints)
    - [API Gateway](#api-gateway-1)
    - [Product Service](#product-service-1)
    - [User Service](#user-service-1)
    - [Order Service](#order-service-1)
  - [Running the Services](#running-the-services)
      - [Start API Gateway:](#start-api-gateway)
      - [Start Product Service:](#start-product-service)
      - [Start User Service:](#start-user-service)
      - [Start Order Service:](#start-order-service)
  - [Testing the API](#testing-the-api)
    - [Example Requests:](#example-requests)
      - [API Gateway](#api-gateway-2)
      - [Product Service](#product-service-2)
      - [User Service](#user-service-2)
      - [Order Service](#order-service-2)

## Getting Started

### Prerequisites
- **Node.js** (version 12 or higher)
- **npm** (Node Package Manager)
- **Postman** or any other API testing tool
- **OpenSSL** for generating SSL certificates (if needed)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/[username]/microservices-api.git
   cd microservices-api
   ```

2. Install dependencies for each component:

#### API Gateway:
   ```bash
   cd api-gateway
   npm install
   npm install express axios dotenv jsonwebtoken cors morgan fs https express-rate-limit
   ```

#### Product Service:
   ```bash
   cd ../product-service
   npm install
   npm install express axios dotenv jsonwebtoken https fs cors morgan express-rate-limit
   ```

#### User Service:
   ```bash
   cd ../user-service
   npm install
   npm install express axios dotenv jsonwebtoken https fs cors morgan express-rate-limit
   ```

#### Order Service:
   ```bash
   cd ../order-service
   npm install
   npm install express axios dotenv jsonwebtoken https fs cors morgan express-rate-limit
   ```

## Services Overview
1. **API Gateway**: Routes requests to the appropriate service and handles authentication.
2. **Product Service**: Manages product-related data and allows CRUD operations for products.
3. **User Service**: Handles user data and supports role-based access control.
4. **Order Service**: Manages orders and interacts with both Product and User services for validation.

## API Endpoints

### API Gateway
- **POST /login**: Authenticate a user and receive a JWT.
- **GET /products**: Route to Product Service to get all products.
- **GET /users/:id**: Route to User Service to get user details by ID.
- **POST /orders**: Route to Order Service to create a new order.

### Product Service
- **POST /products**: Add a new product (Admin only).
- **GET /products/:id**: Get product details by ID.
- **PUT /products/:id**: Update a product (Admin only).
- **DELETE /products/:id**: Delete a product (Admin only).

### User Service
- **POST /users**: Add a new user (Admin only).
- **GET /users/:id**: Get user details by ID.
- **PUT /users/:id**: Update user information (Admin only).
- **DELETE /users/:id**: Delete a user (Admin only).

### Order Service
- **POST /orders**: Create a new order (Customer only).
- **GET /orders**: Get all orders (Admin only).
- **GET /orders/:id**: Get order details by ID (Admin or order owner).
- **DELETE /orders/:id**: Delete an order (Admin only).

## Running the Services

1. Open four terminal windows or tabs.

2. Start each service by navigating to its directory and running the server:

#### Start API Gateway:
   ```bash
   cd api-gateway
   node index.js
   ```

#### Start Product Service:
   ```bash
   cd ../product-service
   node index.js
   ```

#### Start User Service:
   ```bash
   cd ../user-service
   node index.js
   ```

#### Start Order Service:
   ```bash
   cd ../order-service
   node index.js
   ```

Each service will start on its respective port (e.g., API Gateway on 3000, Product on 3001, User on 3002, Order on 3003).

## Testing the API

Use **Postman** or another API testing tool to interact with the services.

### Example Requests:

#### API Gateway
- **Login**:
  - Method: `POST`
  - URL: `https://localhost:3002/login`
  - Body (JSON):
    ```json
    {
      "username": "user1",
      "email": "user@email.com",
      "password": "password123"
      //add role if for admin registration
    }
    ```

#### Product Service
- **Add a New Product**:
  - Method: `POST`
  - URL: `https://localhost:3001/products`
  - Body (JSON):
    ```json
    {
      "name": "Product 1",
      "price": 100
    }
    ```

#### User Service
- **Add a New User**:
  - Method: `POST`
  - URL: `https://localhost:3002/users`
  - Body (JSON):
    ```json
    {
      "name": "User 1",
      "role": "customer"
    }
    ```

#### Order Service
- **Create a New Order**:
  - Method: `POST`
  - URL: `https://localhost:3003/orders`
  - Body (JSON):
    ```json
    {
      "userId": 1,
      "productId": 1
    }
    ```

**Note**: Ensure you provide a valid JWT token in the `Authorization` header for all authenticated routes.

---