const express = require('express');
const { query } = require('../config/db');

const { authenticate, authorize, auditLog } = require('../middleware/auth');

// ========== SUPPLIERS ==========
const suppliers = express.Router();

suppliers.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*, 
        COALESCE(json_agg(DISTINCT jsonb_build_object('type', sa.accreditation_type, 'expiry', sa.expiry_date)) FILTER (WHERE sa.accreditation_id IS NOT NULL), '[]') as accreditations,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', sc.contact_name, 'email', sc.contact_email, 'phone', sc.contact_phone, 'primary', sc.is_primary)) FILTER (WHERE sc.contact_id IS NOT NULL), '[]') as contacts
      FROM supplier s
      LEFT JOIN supplier_accreditation sa ON s.supplier_id = sa.supplier_id
      LEFT JOIN supplier_contact sc ON s.supplier_id = sc.supplier_id
      GROUP BY s.supplier_id
      ORDER BY s.supplier_id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

suppliers.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM supplier WHERE supplier_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

suppliers.post('/', authenticate, authorize('ProcurementOfficer', 'SupplyChainManager'), async (req, res) => {
  try {
    const { business_name, address } = req.body;
    const result = await query(
      'INSERT INTO supplier (business_name, address) VALUES ($1, $2) RETURNING *',
      [business_name, address]
    );
    await auditLog(req.user.emp_id, 'CREATE', 'Supplier', result.rows[0].supplier_id.toString(), `Created supplier: ${business_name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

suppliers.put('/:id', authenticate, authorize('ProcurementOfficer'), async (req, res) => {
  try {
    const { business_name, address } = req.body;
    const result = await query(
      'UPDATE supplier SET business_name = COALESCE($1, business_name), address = COALESCE($2, address) WHERE supplier_id = $3 RETURNING *',
      [business_name, address, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
    await auditLog(req.user.emp_id, 'UPDATE', 'Supplier', req.params.id, `Updated supplier`);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== PARTS ==========
const parts = express.Router();

parts.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM part ORDER BY part_id');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

parts.post('/', authenticate, authorize('ProcurementOfficer'), async (req, res) => {
  try {
    const { part_name, description, part_category } = req.body;
    const result = await query(
      'INSERT INTO part (part_name, description, part_category) VALUES ($1, $2, $3) RETURNING *',
      [part_name, description, part_category]
    );
    await auditLog(req.user.emp_id, 'CREATE', 'Part', result.rows[0].part_id.toString(), `Created part: ${part_name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ORDERS ==========
const orders = express.Router();

orders.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT po.*, s.business_name as supplier_name,
        COALESCE(json_agg(jsonb_build_object('line_id', pol.order_line_id, 'quantity', pol.quantity, 'supplier_part_id', pol.supplier_part_id)) FILTER (WHERE pol.order_line_id IS NOT NULL), '[]') as lines
      FROM purchase_order po
      JOIN supplier s ON po.supplier_id = s.supplier_id
      LEFT JOIN purchase_order_line pol ON po.order_id = pol.order_id
      GROUP BY po.order_id, s.business_name
      ORDER BY po.order_date DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

orders.post('/', authenticate, authorize('ProcurementOfficer'), async (req, res) => {
  try {
    const { supplier_id, desired_delivery_date, lines } = req.body;
    const orderResult = await query(
      'INSERT INTO purchase_order (supplier_id, desired_delivery_date) VALUES ($1, $2) RETURNING *',
      [supplier_id, desired_delivery_date]
    );
    const order = orderResult.rows[0];
    if (lines && lines.length > 0) {
      for (const line of lines) {
        await query(
          'INSERT INTO purchase_order_line (order_id, supplier_part_id, quantity) VALUES ($1, $2, $3)',
          [order.order_id, line.supplier_part_id, line.quantity]
        );
      }
    }
    await auditLog(req.user.emp_id, 'CREATE', 'PurchaseOrder', order.order_id.toString(), `Created order for supplier ${supplier_id}`);
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

orders.put('/:id/status', authenticate, authorize('ProcurementOfficer', 'SupplyChainManager'), async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query(
      'UPDATE purchase_order SET status = $1, actual_delivery_date = CASE WHEN $1 = \'Delivered\' THEN CURRENT_DATE ELSE actual_delivery_date END WHERE order_id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    await auditLog(req.user.emp_id, 'UPDATE', 'PurchaseOrder', req.params.id, `Status changed to ${status}`);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== SHIPMENTS ==========
const shipments = express.Router();

shipments.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT sh.*, po.status as order_status, s.business_name as supplier_name
      FROM shipment sh
      JOIN purchase_order po ON sh.order_id = po.order_id
      JOIN supplier s ON po.supplier_id = s.supplier_id
      ORDER BY sh.shipment_id DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

shipments.post('/', authenticate, authorize('ProcurementOfficer', 'SupplyChainManager'), async (req, res) => {
  try {
    const { order_id, tracking_number, port_of_entry } = req.body;
    const result = await query(
      'INSERT INTO shipment (order_id, tracking_number, port_of_entry) VALUES ($1, $2, $3) RETURNING *',
      [order_id, tracking_number, port_of_entry]
    );
    await auditLog(req.user.emp_id, 'CREATE', 'Shipment', result.rows[0].shipment_id.toString(), `Created shipment for order ${order_id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== AUDIT LOG ==========
const audit = express.Router();

audit.get('/', authenticate, authorize('Auditor', 'SupplyChainManager'), async (req, res) => {
  try {
    const result = await query(`
      SELECT al.*, ua.full_name as user_name
      FROM audit_log al
      JOIN user_account ua ON al.emp_id = ua.emp_id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== DASHBOARD STATS ==========
const dashboard = express.Router();

dashboard.get('/stats', authenticate, async (req, res) => {
  try {
    const suppliersCount = await query('SELECT COUNT(*) FROM supplier');
    const ordersCount = await query('SELECT COUNT(*) FROM purchase_order');
    const activeOrders = await query("SELECT COUNT(*) FROM purchase_order WHERE status NOT IN ('Completed')");
    const shipmentsInTransit = await query("SELECT COUNT(*) FROM shipment WHERE shipment_status = 'In Transit'");
    const deliveredItems = await query('SELECT COUNT(*) FROM delivered_item');
    const ordersByStatus = await query('SELECT status, COUNT(*) as count FROM purchase_order GROUP BY status');
    
    res.json({
      totalSuppliers: parseInt(suppliersCount.rows[0].count),
      totalOrders: parseInt(ordersCount.rows[0].count),
      activeOrders: parseInt(activeOrders.rows[0].count),
      shipmentsInTransit: parseInt(shipmentsInTransit.rows[0].count),
      deliveredItems: parseInt(deliveredItems.rows[0].count),
      ordersByStatus: ordersByStatus.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = { suppliers, parts, orders, shipments, audit, dashboard };
