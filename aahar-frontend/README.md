# Aahar.AI - Frontend

Welcome to the frontend application for **Aahar.AI**, an AI-powered surplus food redistribution platform! This frontend provides a sleek, modern UI for donors, NGOs, and delivery agents to interact and prevent food waste.

## 🚀 Technologies Used
- **React** (powered by **Vite** for blazing fast builds)
- **Tailwind CSS** (for styling and comprehensive Dark/Light Mode support)
- **React Router** (for page navigation)
- **Leaflet & React-Leaflet** (for live maps and real-time delivery tracking)
- **Socket.IO Client** (for real-time donation alerts)

## 📦 Step-by-Step Setup & Installation

Follow these instructions to run the frontend application on your local machine:

**Step 1: Clone and Navigate**
```bash
git clone <your-repository-url>
cd aahar-frontend
```

**Step 2: Install Required Libraries**
This project relies on Vite, React Router, Tailwind, and Leaflet. Install them by running:
```bash
npm install axios react-router-dom socket.io-client react-leaflet leaflet lucide-react framer-motion tailwindcss
```
*(Note: If you run `npm install` without arguments, it will automatically install everything from your package.json).*

**Step 3: Connect to the Backend**
By default, the frontend connects to the live production server at `https://aahar-ai-xs0e.onrender.com`. 
If you want to test against your local cluster, open `src/api/axios.js` and change `BASE_URL` to `http://localhost:3000`.

## 🛠️ Running the Application

To start the lightning-fast Vite development server:
```bash
npm run dev
```
The application will instantly compile and be available at `http://localhost:5173`. Open this URL in your browser to interact with the UI!

## 🎨 Features
- **Role-based Dashboards:** Dedicated views for Donors, NGOs, and Delivery Agents.
- **Real-time Map:** See donation spots, NGO locations, and active delivery agent routes.
- **Dark Mode:** A meticulously designed dark mode featuring deep indigos and crimson accents.
