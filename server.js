require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const formRoutes = require('./routes/formRoutes');
const bodyParser = require('body-parser');
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://finline.vercel.app'  // Add your deployed frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(logger('dev'));

app.use(bodyParser.json());
// Add request logging middleware before routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Routes
app.use('/api/forms', formRoutes);

// Error handling middleware should be last
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
