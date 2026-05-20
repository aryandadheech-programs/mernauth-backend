require('dotenv').config();

const express = require('express');

const cookieParser = require('cookie-parser');

const cors = require('cors');

const connectDB = require('./db');

const authRoutes = require('./authroutes');

const app = express();

// DATABASE
connectDB();

// CORS
app.use(cors({
  origin: 'https://loginauthenticationformar.netlify.app',
  credentials: true
}));

// MIDDLEWARE
app.use(express.json());

app.use(cookieParser());

// ROUTES
app.use('/api/auth', authRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('API Running...');
});

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});