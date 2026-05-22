const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb+srv://Aero_User:dY2SH9YDKcV3vdAy@aeronet.z73bbgp.mongodb.net/?appName=AeroNet');
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  await db.collection('qc_reports').insertMany([
    { deliveredItemId: 1, partId: 'A-320-WING-01', reportType: 'Dimensional+NDT', currentStatus: 'Approved', versions: [{ versionNo: 1, createdAt: new Date(), createdByEmpId: 2, inspectorName: 'James Chen', resultSummary: 'Pass', results: { visualInspection: 'Pass', dimensionalTolerance: { result: 'Pass', deviation: 0.002 } } }] },
    { deliveredItemId: 2, partId: 'B-737-FUSE-02', reportType: 'Environmental', currentStatus: 'Draft', versions: [{ versionNo: 1, createdAt: new Date(), createdByEmpId: 2, inspectorName: 'James Chen', resultSummary: 'Fail', results: { environmentalTest: { temperatureRange: '-55 to 70C', result: 'Fail' } } }] },
    { deliveredItemId: 3, partId: 'A-320-WING-01', reportType: 'Visual', currentStatus: 'Approved', versions: [{ versionNo: 1, createdAt: new Date(), createdByEmpId: 2, inspectorName: 'James Chen', resultSummary: 'Pass', results: { visualInspection: 'Pass' } }] }
  ]);
  console.log('QC reports inserted');

  await db.collection('certifications').insertMany([
    { deliveredItemId: 1, issuedAt: new Date(), approvedAt: new Date(), approvedByEmpId: 2, isImmutable: true, certificationDocRef: '/docs/CERT-001.pdf', digitalStamp: 'CertifiedOK', materialTraceability: { batchIds: ['MB-001'], rawMaterialOrigin: 'Titanium Aerospace Ltd' } },
    { deliveredItemId: 2, issuedAt: new Date(), approvedAt: null, approvedByEmpId: null, isImmutable: false, certificationDocRef: '/docs/CERT-002.pdf', digitalStamp: null, materialTraceability: { batchIds: ['MB-002'], rawMaterialOrigin: 'Global Composites Inc' } }
  ]);
  console.log('Certifications inserted');

  await db.collection('sensor_readings').insertMany([
    { deviceId: 'SENS-T-001', equipmentId: 'EQ-1', timestamp: new Date(), readings: { temperature: 72.5, vibration: 0.03, pressure: 101.2, gpsPosition: { lat: 53.38, lng: -1.47 } }, alerts: [] },
    { deviceId: 'SENS-T-002', equipmentId: 'EQ-2', timestamp: new Date(), readings: { temperature: 180.2, vibration: 0.01, pressure: 102.5, gpsPosition: { lat: 43.60, lng: 1.44 } }, alerts: [] },
    { deviceId: 'SENS-C-003', equipmentId: null, timestamp: new Date(), readings: { temperature: 22.1, vibration: 0.15, pressure: 99.8, gpsPosition: { lat: 51.94, lng: 4.14 } }, alerts: ['High vibration warning'] }
  ]);
  console.log('Sensor readings inserted');

  await db.collection('shipment_events').insertMany([
    { shipmentId: 1, eventTimestamp: new Date(), eventType: 'Checkpoint', gpsLocation: { lat: 53.38, lng: -1.47 }, locationText: 'Sheffield Warehouse', conditionData: { containerTemp: 21.5, humidity: 42, shockDetected: false } },
    { shipmentId: 3, eventTimestamp: new Date(), eventType: 'ConditionUpdate', gpsLocation: { lat: 51.94, lng: 4.14 }, locationText: 'Port of Rotterdam', conditionData: { containerTemp: 19.5, humidity: 48, shockDetected: true } }
  ]);
  console.log('Shipment events inserted');

  await db.collection('part_baseline_specs').insertMany([
    { partId: 'A-320-WING-01', mechanicalProperties: { tensileStrength: '480 MPa', yieldPoint: '350 MPa' }, processDetails: { heatTreatment: 'T6 aging at 175C', machiningSteps: ['CNC milling', 'Surface grinding'] }, cadModelRef: '/cad/A320-WING-01.stp', baselineNotes: 'Critical load-bearing component' },
    { partId: 'B-737-FUSE-02', mechanicalProperties: { tensileStrength: '520 MPa', yieldPoint: '380 MPa' }, processDetails: { heatTreatment: 'Solution treated', machiningSteps: ['Forging', 'CNC turning'] }, cadModelRef: '/cad/B737-FUSE-02.stp', baselineNotes: 'Fuselage structural panel' }
  ]);
  console.log('Part baseline specs inserted');

  await db.collection('supplier_part_features').insertMany([
    { supplierPartId: 1, featureType: 'RFID', featureDescription: 'Serialized RFID tags for lifecycle tracking', featureDataRef: '/data/rfid-spec-001.pdf' },
    { supplierPartId: 2, featureType: 'ShockSensor', featureDescription: 'Embedded piezoelectric shock sensors', featureDataRef: '/data/shock-spec-002.pdf' },
    { supplierPartId: 4, featureType: 'DigitalTwin', featureDescription: 'Real-time digital twin data feed', featureDataRef: '/data/twin-spec-004.pdf' }
  ]);
  console.log('Supplier part features inserted');

  console.log('ALL DONE!');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e.message); process.exit(1); });