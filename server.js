require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./authroutes');

const app = express();

// Connect Database
connectDB();

// 1. CORS Middleware (Updated)
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://loginauthenticationformar.netlify.app'
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Explicitly handle pre-flight requests
app.options('*', cors()); 

app.use(express.json());
app.use(cookieParser());

// 3. Debugging Middleware (Ye check karne ke liye ki kya aa raha hai)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers.authorization);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));