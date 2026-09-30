# Aahar.AI - Backend

Welcome to the backend server for **Aahar.AI**. This Node.js server handles authentication, real-time WebSocket communication, and orchestrates connections with the Python AI Engine.

## 🌟 Modern SDE-2 Architecture
This backend has been recently refactored to a highly scalable, production-ready architecture:
- **MVC & Services Design:** Controllers handle HTTP logic, Services handle business logic (AI, Sockets, Redis), and clean Routes connect everything.
- **Node.js Cluster Load Balancer:** The Master process automatically spins up identical Worker instances for every CPU core, seamlessly balancing massive loads without requiring Nginx.
- **Centralized Redis Brain:** Replaced local memory maps with a Cloud Redis database, allowing thousands of connected NGOs and Delivery Agents to seamlessly communicate across all Load-Balanced clusters via the Socket.IO Redis Adapter.
- **Atomic Database Locking:** Real-time Race Condition prevention using MongoDB, ensuring two Delivery Agents cannot simultaneously claim the same food broadcast.

## 🚀 Technologies Used
- **Node.js & Express**
- **Node `cluster` module** (Built-in Native Load Balancing)
- **Redis & Upstash** (for Centralized State)
- **MongoDB & Mongoose** (for persistent storage and atomic locking)
- **Socket.IO + Redis Adapter** (for distributed real-time broadcasting)
- **JWT (JSON Web Tokens)** (for secure, cookie-based authentication)
- **Rate-Limiter-Flexible** (for API protection via Redis)

## 🔐 Environment Variables
Before running the backend, configure your `.env` file in this directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PYTHON_ENGINE_URL=https://your-python-ai-engine-url.com
REDIS_URL=your_upstash_or_cloud_redis_url
```

## 📦 Step-by-Step Setup & Installation

Follow these instructions to run the load-balanced cluster on your local machine:

**Step 1: Clone and Navigate**
```bash
git clone <your-repository-url>
cd backend
```

**Step 2: Install Required Libraries**
This project relies on several powerful libraries. Install them by running:
```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken cookie-parser socket.io redis @socket.io/redis-adapter rate-limiter-flexible axios
```

**Step 3: Setup your Redis Database**
1. Go to [Upstash](https://upstash.com/) and create a free serverless Redis database.
2. Copy your `REDIS_URL`.

**Step 4: Configure Environment Variables**
Create a `.env` file in the root of the `backend` folder and add the following:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PYTHON_ENGINE_URL=https://your-python-ai-engine-url.com
REDIS_URL=your_upstash_redis_url
```

## 🛠️ Running the Application

To boot up the powerful Master/Worker cluster, simply run:
```bash
npm start
```
You will instantly see the Master process detect your CPU cores and spin up multiple load-balanced Worker servers in your terminal!

## ⚡ Key Architecture Folders
- `/controllers`: HTTP Request/Response logic (Auth, Donations, Stats)
- `/services`: Core Business Logic (Socket setup, Redis setup, AI HTTP requests)
- `/routes`: Express URL Mappings
- `/models`: MongoDB Schemas
- `/middleware`: Reusable request pipelines (Rate Limiting)
