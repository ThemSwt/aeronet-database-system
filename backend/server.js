const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectMongo = require('./config/mongo');
const { query } = require('./config/db');


// Import routes
const authRoutes = require('./routes/auth');
const { suppliers, parts, orders, shipments, audit, dashboard } = require('./routes/sqlRoutes');
const { qcReports, certifications, iot, shipmentEvents } = require('./routes/mongoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ========== API ROUTES ==========
// Auth
app.use('/api/auth', authRoutes);

// PostgreSQL routes
app.use('/api/suppliers', suppliers);
app.use('/api/parts', parts);
app.use('/api/orders', orders);
app.use('/api/shipments', shipments);
app.use('/api/audit', audit);
app.use('/api/dashboard', dashboard);

// MongoDB routes
app.use('/api/qc-reports', qcReports);
app.use('/api/certifications', certifications);
app.use('/api/iot', iot);
app.use('/api/shipment-events', shipmentEvents);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const pgResult = await query('SELECT NOW()');
    const mongoStatus = require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'OK',
      postgresql: pgResult.rows[0].now,
      mongodb: mongoStatus,
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// Serve frontend for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

// Start server IMMEDIATELY, connect databases in background
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectMongo().then(() => {
  console.log('MongoDB ready');
}).catch(err => {
  console.error('MongoDB error:', err.message);
});
