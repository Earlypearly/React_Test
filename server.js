const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import API routes from your api folder
const apiRoutes = require('./api/index.js');

// Mount API routes
app.use('/api', apiRoutes);

// Serve static React frontend (optional, if you build React)
app.use(express.static(path.join(__dirname, 'react test/dist')));

// Fallback for React Router (optional, if you build React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react test/dist/index.html'));
});

// Port binding for Render
const PORT = parseInt(process.env.PORT || 5000, 10);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
