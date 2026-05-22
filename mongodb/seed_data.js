// MongoDB Seed Data for AeroNetB
// Run this in MongoDB Shell after connecting to your Atlas cluster:
// mongosh "mongodb+srv://Aero_User:dY2SH9YDKcV3vdAy@aeronet.z73bbgp.mongodb.net/aeronetsystem"

use aeronetsystem;

// ========== QC REPORTS ==========
db.qc_reports.insertMany([
  {
    deliveredItemId: 1,
    partId: "A-320-WING-01",
    reportType: "Dimensional+NDT",
    currentStatus: "Approved",
    versions: [{
      versionNo: 1,
      createdAt: new Date("2025-03-15T10:00:00Z"),
      createdByEmpId: 2,
      inspectorName: "James Chen",
      resultSummary: "Pass",
      results: {
        visualInspection: "Pass",
        dimensionalTolerance: { result: "Pass", deviation: 0.002, measurements: [
          { dimension: "length", measured: 15.002, unit: "m" },
          { dimension: "width", measured: 3.499, unit: "m" }
        ]},
        nondestructiveTesting: { type: "Ultrasonic", result: "Pass", comments: "No internal defects detected." }
      }
    }]
  },
  {
    deliveredItemId: 2,
    partId: "A-320-WING-01",
    reportType: "Environmental",
    currentStatus: "Approved",
    versions: [{
      versionNo: 1,
      createdAt: new Date("2025-03-16T09:00:00Z"),
      createdByEmpId: 2,
      inspectorName: "James Chen",
      resultSummary: "Pass",
      results: {
        environmentalTest: {
          temperatureRange: "-55 to 70C",
          humidityExposure: "95% RH for 48 hours",
          result: "Pass"
        }
      },
      notes: "Component withstood environmental stress without cracking."
    }]
  },
  {
    deliveredItemId: 3,
    partId: "B-737-FUSE-02",
    reportType: "Visual",
    currentStatus: "Draft",
    versions: [{
      versionNo: 1,
      createdAt: new Date("2025-04-10T11:00:00Z"),
      createdByEmpId: 2,
      inspectorName: "James Chen",
      resultSummary: "Fail",
      results: {
        visualInspection: "Fail",
        defectsFound: ["Surface scratch on panel B3", "Minor discoloration near rivet line"]
      },
      notes: "Requires re-inspection after surface treatment."
    }]
  }
]);

// ========== CERTIFICATIONS ==========
db.certifications.insertMany([
  {
    deliveredItemId: 1,
    issuedAt: new Date("2025-03-18T09:00:00Z"),
    approvedAt: new Date("2025-03-18T14:00:00Z"),
    approvedByEmpId: 2,
    isImmutable: true,
    certificationDocRef: "/docs/certs/CERT-2025-001.pdf",
    digitalStamp: "CertifiedOK",
    materialTraceability: {
      batchIds: ["MB-001", "MB-002"],
      rawMaterialOrigin: "Titanium Aerospace Ltd, Batch 2025-Q1"
    }
  },
  {
    deliveredItemId: 2,
    issuedAt: new Date("2025-03-20T10:00:00Z"),
    approvedAt: null,
    approvedByEmpId: null,
    isImmutable: false,
    certificationDocRef: "/docs/certs/CERT-2025-002.pdf",
    digitalStamp: null,
    materialTraceability: {
      batchIds: ["MB-001"],
      rawMaterialOrigin: "Titanium Aerospace Ltd, Batch 2025-Q1"
    }
  }
]);

// ========== SENSOR READINGS ==========
db.sensor_readings.insertMany([
  { deviceId: "SENS-T-001", equipmentId: "EQ-1", timestamp: new Date("2025-09-15T14:30:00Z"), readings: { temperature: 72.5, vibration: 0.03, pressure: 101.2, gpsPosition: { lat: 53.3811, lng: -1.4701 } }, alerts: [] },
  { deviceId: "SENS-T-001", equipmentId: "EQ-1", timestamp: new Date("2025-09-15T14:35:00Z"), readings: { temperature: 73.1, vibration: 0.04, pressure: 101.1, gpsPosition: { lat: 53.3811, lng: -1.4701 } }, alerts: [] },
  { deviceId: "SENS-T-002", equipmentId: "EQ-2", timestamp: new Date("2025-09-15T14:30:00Z"), readings: { temperature: 180.2, vibration: 0.01, pressure: 102.5, gpsPosition: { lat: 43.6047, lng: 1.4442 } }, alerts: [] },
  { deviceId: "SENS-C-003", equipmentId: null, timestamp: new Date("2025-09-15T14:30:00Z"), readings: { temperature: 22.1, vibration: 0.15, pressure: 99.8, gpsPosition: { lat: 51.9489, lng: 4.1433 } }, alerts: ["High vibration warning"] },
  { deviceId: "SENS-T-004", equipmentId: "EQ-4", timestamp: new Date("2025-09-15T14:30:00Z"), readings: { temperature: 950.0, vibration: 0.02, pressure: 100.0, gpsPosition: { lat: 48.1351, lng: 11.5820 } }, alerts: [] }
]);

// ========== SHIPMENT EVENTS ==========
db.shipment_events.insertMany([
  { shipmentId: 1, eventTimestamp: new Date("2025-03-01T08:00:00Z"), eventType: "Checkpoint", gpsLocation: { lat: 53.3811, lng: -1.4701 }, locationText: "Sheffield Warehouse", conditionData: { containerTemp: 21.5, humidity: 42.0, shockDetected: false } },
  { shipmentId: 1, eventTimestamp: new Date("2025-03-05T12:00:00Z"), eventType: "Checkpoint", gpsLocation: { lat: 51.5074, lng: -0.1278 }, locationText: "Port of London", conditionData: { containerTemp: 20.8, humidity: 55.0, shockDetected: false } },
  { shipmentId: 3, eventTimestamp: new Date("2025-04-20T10:00:00Z"), eventType: "Checkpoint", gpsLocation: { lat: 34.6937, lng: 135.5023 }, locationText: "Port of Osaka", conditionData: { containerTemp: 23.0, humidity: 60.0, shockDetected: false } },
  { shipmentId: 3, eventTimestamp: new Date("2025-05-01T08:00:00Z"), eventType: "ConditionUpdate", gpsLocation: { lat: 51.9489, lng: 4.1433 }, locationText: "Port of Rotterdam", conditionData: { containerTemp: 19.5, humidity: 48.0, shockDetected: true } }
]);

// ========== PART BASELINE SPECS ==========
db.part_baseline_specs.insertMany([
  { partId: "A-320-WING-01", mechanicalProperties: { tensileStrength: "480 MPa", fatigueLimit: "10^7 cycles at 200 MPa", yieldPoint: "350 MPa" }, processDetails: { heatTreatment: "T6 aging at 175C for 8hrs", machiningSteps: ["CNC milling", "Surface grinding"], surfaceFinishing: "Anodising Type III" }, cadModelRef: "/cad/A320-WING-01.stp", engineeringDrawingRef: "/drawings/A320-WING-01.pdf", prototypeMediaRef: ["/images/wing_prototype_v1.jpg"], baselineNotes: "Critical load-bearing component." },
  { partId: "B-737-FUSE-02", mechanicalProperties: { tensileStrength: "520 MPa", fatigueLimit: "10^7 cycles at 220 MPa", yieldPoint: "380 MPa" }, processDetails: { heatTreatment: "Solution treated + aged", machiningSteps: ["Forging", "CNC turning"], surfaceFinishing: "Chromate conversion" }, cadModelRef: "/cad/B737-FUSE-02.stp", engineeringDrawingRef: "/drawings/B737-FUSE-02.pdf", prototypeMediaRef: [], baselineNotes: "Fuselage structural panel." }
]);

// ========== SUPPLIER PART FEATURES ==========
db.supplier_part_features.insertMany([
  { supplierPartId: 1, featureType: "RFID", featureDescription: "Serialized RFID tags embedded for lifecycle tracking", featureDataRef: "/data/rfid-spec-001.pdf" },
  { supplierPartId: 1, featureType: "Coating", featureDescription: "Anti-corrosion PVD coating, 15 micron thickness", featureDataRef: "/data/coating-spec-001.pdf" },
  { supplierPartId: 2, featureType: "ShockSensor", featureDescription: "Embedded piezoelectric shock detection sensors", featureDataRef: "/data/shock-spec-002.pdf" },
  { supplierPartId: 4, featureType: "DigitalTwin", featureDescription: "Real-time digital twin data feed via API", featureDataRef: "/data/twin-spec-004.pdf" }
]);

print("=== All seed data inserted successfully! ===");
