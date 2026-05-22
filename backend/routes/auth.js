const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Get user
    const userResult = await query('SELECT * FROM user_account WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = userResult.rows[0];

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Get user role
    const roleResult = await query(
      'SELECT r.role_name FROM user_role ur JOIN role r ON ur.role_id = r.role_id WHERE ur.emp_id = $1',
      [user.emp_id]
    );
    const role = roleResult.rows.length > 0 ? roleResult.rows[0].role_name : 'Unknown';

    // Generate JWT
    const token = jwt.sign(
      { emp_id: user.emp_id, email: user.email, name: user.full_name, role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { emp_id: user.emp_id, name: user.full_name, email: user.email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register (for setup only)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, job_title, department, phone, role_name } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO user_account (full_name, email, password_hash, job_title, department, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING emp_id',
      [full_name, email, hash, job_title, department, phone]
    );
    const empId = result.rows[0].emp_id;

    if (role_name) {
      const roleResult = await query('SELECT role_id FROM role WHERE role_name = $1', [role_name]);
      if (roleResult.rows.length > 0) {
        await query('INSERT INTO user_role (emp_id, role_id) VALUES ($1, $2)', [empId, roleResult.rows[0].role_id]);
      }
    }

    res.status(201).json({ emp_id: empId, message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
