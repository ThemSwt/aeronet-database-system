const express = require('express');
const { QCReport, Certification, SensorReading, ShipmentEvent } = require('../models');
const { authenticate, authorize, auditLog } = require('../middleware/auth');

// ========== QC REPORTS ==========
const qcReports = express.Router();

qcReports.get('/', authenticate, async (req, res) => {
  try {
    const reports = await QCReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

qcReports.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await QCReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'QC Report not found' });
    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

qcReports.post('/', authenticate, authorize('QualityInspector'), async (req, res) => {
  try {
    const report = new QCReport({
      deliveredItemId: req.body.deliveredItemId,
      partId: req.body.partId,
      reportType: req.body.reportType,
      currentStatus: 'Draft',
      versions: [{
        versionNo: 1,
        createdByEmpId: req.user.emp_id,
        inspectorName: req.user.name,
        resultSummary: req.body.resultSummary,
        results: req.body.results,
        notes: req.body.notes
      }]
    });
    await report.save();
    await auditLog(req.user.emp_id, 'CREATE', 'QCReport', report._id.toString(), `Created ${req.body.reportType} report`);
    res.status(201).json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

qcReports.put('/:id/approve', authenticate, authorize('QualityInspector'), async (req, res) => {
  try {
    const report = await QCReport.findByIdAndUpdate(
      req.params.id,
      { currentStatus: 'Approved' },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'QC Report not found' });
    await auditLog(req.user.emp_id, 'APPROVE', 'QCReport', req.params.id, 'Approved QC report');
    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add new version to existing report
qcReports.post('/:id/version', authenticate, authorize('QualityInspector'), async (req, res) => {
  try {
    const report = await QCReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'QC Report not found' });
    const newVersion = {
      versionNo: report.versions.length + 1,
      createdByEmpId: req.user.emp_id,
      inspectorName: req.user.name,
      resultSummary: req.body.resultSummary,
      results: req.body.results,
      notes: req.body.notes
    };
    report.versions.push(newVersion);
    report.currentStatus = 'Submitted';
    await report.save();
    await auditLog(req.user.emp_id, 'UPDATE', 'QCReport', req.params.id, `Added version ${newVersion.versionNo}`);
    res.json(report);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== CERTIFICATIONS ==========
const certifications = express.Router();

certifications.get('/', authenticate, async (req, res) => {
  try {
    const certs = await Certification.find().sort({ issuedAt: -1 });
    res.json(certs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

certifications.post('/', authenticate, authorize('QualityInspector'), async (req, res) => {
  try {
    const cert = new Certification({
      deliveredItemId: req.body.deliveredItemId,
      certificationDocRef: req.body.certificationDocRef,
      digitalStamp: req.body.digitalStamp,
      materialTraceability: req.body.materialTraceability
    });
    await cert.save();
    await auditLog(req.user.emp_id, 'CREATE', 'Certification', cert._id.toString(), 'Created certification');
    res.status(201).json(cert);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// APPROVE certification - makes it IMMUTABLE
certifications.put('/:id/approve', authenticate, authorize('QualityInspector'), async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    if (cert.isImmutable) return res.status(403).json({ error: 'Certification is already approved and immutable. No changes allowed.' });

    cert.approvedAt = new Date();
    cert.approvedByEmpId = req.user.emp_id;
    cert.isImmutable = true;
    await cert.save();
    await auditLog(req.user.emp_id, 'APPROVE', 'Certification', req.params.id, 'Approved and locked certification');
    res.json({ message: 'Certification approved and locked', certification: cert });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// BLOCK updates to immutable certifications
certifications.put('/:id', authenticate, async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    if (cert.isImmutable) {
      return res.status(403).json({ error: 'IMMUTABLE: This certification has been approved and cannot be modified.' });
    }
    Object.assign(cert, req.body);
    await cert.save();
    await auditLog(req.user.emp_id, 'UPDATE', 'Certification', req.params.id, 'Updated certification');
    res.json(cert);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// BLOCK deletes of immutable certifications
certifications.delete('/:id', authenticate, async (req, res) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    if (cert.isImmutable) {
      return res.status(403).json({ error: 'IMMUTABLE: This certification has been approved and cannot be deleted.' });
    }
    await cert.deleteOne();
    await auditLog(req.user.emp_id, 'DELETE', 'Certification', req.params.id, 'Deleted certification');
    res.json({ message: 'Certification deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== IoT / SENSOR READINGS ==========
const iot = express.Router();

iot.get('/readings', authenticate, async (req, res) => {
  try {
    const readings = await SensorReading.find().sort({ timestamp: -1 }).limit(50);
    res.json(readings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

iot.post('/readings', authenticate, authorize('EquipmentEngineer'), async (req, res) => {
  try {
    const reading = new SensorReading(req.body);
    await reading.save();
    res.status(201).json(reading);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

iot.get('/readings/device/:deviceId', authenticate, async (req, res) => {
  try {
    const readings = await SensorReading.find({ deviceId: req.params.deviceId }).sort({ timestamp: -1 }).limit(20);
    res.json(readings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== SHIPMENT EVENTS ==========
const shipmentEvents = express.Router();

shipmentEvents.get('/:shipmentId', authenticate, async (req, res) => {
  try {
    const events = await ShipmentEvent.find({ shipmentId: parseInt(req.params.shipmentId) }).sort({ eventTimestamp: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

shipmentEvents.post('/', authenticate, authorize('ProcurementOfficer', 'SupplyChainManager'), async (req, res) => {
  try {
    const event = new ShipmentEvent(req.body);
    await event.save();
    await auditLog(req.user.emp_id, 'CREATE', 'ShipmentEvent', event._id.toString(), `Shipment ${req.body.shipmentId} update`);
    res.status(201).json(event);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = { qcReports, certifications, iot, shipmentEvents };
