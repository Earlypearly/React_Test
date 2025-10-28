const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tempRoutes = require('./routes/temp');

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(cors({
  origin: "https://react-test-frontend.onrender.com",
  credentials: true
}));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// ===== LOAD ROUTES =====
authRoutes(app);
tempRoutes(app);

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
