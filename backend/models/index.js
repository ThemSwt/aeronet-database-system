const mongoose = require('mongoose');

// QC Report - variable schema with embedded versions
const qcReportSchema = new mongoose.Schema({
  deliveredItemId: { type: Number, required: true },
  partId: String,
  reportType: { type: String, enum: ['Visual', 'Dimensional', 'NDT', 'Environmental', 'Dimensional+NDT'] },
  currentStatus: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
  versions: [{
    versionNo: Number,
    createdAt: { type: Date, default: Date.now },
    createdByEmpId: Number,
    inspectorName: String,
    resultSummary: String,
    results: mongoose.Schema.Types.Mixed,
    notes: String
  }]
}, { timestamps: true });

// Certification - immutable once approved
const certificationSchema = new mongoose.Schema({
  deliveredItemId: { type: Number, required: true },
  issuedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  approvedByEmpId: Number,
  isImmutable: { type: Boolean, default: false },
  certificationDocRef: String,
  digitalStamp: String,
  materialTraceability: {
    batchIds: [String],
    rawMaterialOrigin: String
  }
}, { timestamps: true });

// Sensor Reading - time-series IoT data
const sensorReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  equipmentId: String,
  timestamp: { type: Date, default: Date.now },
  readings: {
    temperature: Number,
    vibration: Number,
    pressure: Number,
    gpsPosition: { lat: Number, lng: Number }
  },
  alerts: [String]
}, { timestamps: true });

// Part Baseline Spec - rich variable specs
const partBaselineSpecSchema = new mongoose.Schema({
  partId: { type: String, required: true },
  mechanicalProperties: mongoose.Schema.Types.Mixed,
  processDetails: mongoose.Schema.Types.Mixed,
  cadModelRef: String,
  engineeringDrawingRef: String,
  prototypeMediaRef: [String],
  baselineNotes: String
}, { timestamps: true });

// Shipment Event - tracking updates
const shipmentEventSchema = new mongoose.Schema({
  shipmentId: { type: Number, required: true },
  eventTimestamp: { type: Date, default: Date.now },
  eventType: { type: String, enum: ['Checkpoint', 'ConditionUpdate'] },
  gpsLocation: { lat: Number, lng: Number },
  locationText: String,
  conditionData: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Supplier Part Feature - variable customisations
const supplierPartFeatureSchema = new mongoose.Schema({
  supplierPartId: { type: Number, required: true },
  featureType: String,
  featureDescription: String,
  featureDataRef: String
}, { timestamps: true });

module.exports = {
  QCReport: mongoose.model('QCReport', qcReportSchema, 'qc_reports'),
  Certification: mongoose.model('Certification', certificationSchema, 'certifications'),
  SensorReading: mongoose.model('SensorReading', sensorReadingSchema, 'sensor_readings'),
  PartBaselineSpec: mongoose.model('PartBaselineSpec', partBaselineSpecSchema, 'part_baseline_specs'),
  ShipmentEvent: mongoose.model('ShipmentEvent', shipmentEventSchema, 'shipment_events'),
  SupplierPartFeature: mongoose.model('SupplierPartFeature', supplierPartFeatureSchema, 'supplier_part_features')
};
