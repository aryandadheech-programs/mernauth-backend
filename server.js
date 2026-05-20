require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./authroutes');

const app = express();

connectDB();

// CORS ko sirf ek line mein likho, sabse simple tareeka
app.use(cors({
  origin: ['https://loginauthenticationformar.netlify.app'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));