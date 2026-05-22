const jwt = require('jsonwebtoken');
const { query } = require('../config/db');


// Verify JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Check role-based access
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

// Log action to audit_log table
async function auditLog(empId, actionType, entityType, entityId, details) {
  try {
    await query(
      'INSERT INTO audit_log (emp_id, action_type, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [empId, actionType, entityType, entityId, details]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { authenticate, authorize, auditLog };
