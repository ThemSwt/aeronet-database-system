-- ============================================
-- AeroNetB Aerospace - Sample Data (DML)
-- ============================================

-- ROLES
INSERT INTO role (role_name) VALUES 
    ('ProcurementOfficer'),
    ('QualityInspector'),
    ('SupplyChainManager'),
    ('EquipmentEngineer'),
    ('Auditor');

-- PERMISSIONS
INSERT INTO permission (permission_name, scope) VALUES
    ('Read', 'Suppliers'), ('Write', 'Suppliers'),
    ('Read', 'Orders'), ('Write', 'Orders'),
    ('Read', 'QCReports'), ('Write', 'QCReports'), ('Approve', 'QCReports'),
    ('Read', 'Certifications'), ('Approve', 'Certifications'),
    ('Read', 'IoT'),
    ('Read', 'AuditLog'), ('Audit', 'AuditLog'),
    ('Read', 'Shipments'), ('Write', 'Shipments');

-- ROLE PERMISSIONS
-- ProcurementOfficer: Read/Write Suppliers, Orders, Shipments
INSERT INTO role_permission (role_id, permission_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 13), (1, 14);
-- QualityInspector: Read/Write/Approve QC, Read/Approve Certs
INSERT INTO role_permission (role_id, permission_id) VALUES
    (2, 5), (2, 6), (2, 7), (2, 8), (2, 9);
-- SupplyChainManager: Read everything
INSERT INTO role_permission (role_id, permission_id) VALUES
    (3, 1), (3, 3), (3, 5), (3, 8), (3, 10), (3, 13);
-- EquipmentEngineer: Read IoT, Read Equipment
INSERT INTO role_permission (role_id, permission_id) VALUES
    (4, 10);
-- Auditor: Read AuditLog, Read all
INSERT INTO role_permission (role_id, permission_id) VALUES
    (5, 1), (5, 3), (5, 5), (5, 8), (5, 10), (5, 11), (5, 12), (5, 13);

-- USERS (passwords are bcrypt hashes of 'password123')
INSERT INTO user_account (full_name, job_title, department, email, phone, password_hash) VALUES
    ('Sarah Johnson', 'Senior Procurement Officer', 'Procurement', 'sarah.johnson@aeronetb.com', '+44-20-7946-0001', '$2b$10$fKZ2hGXbgCAbYtEJOVXivucMUJfZ.xsmFqzCmJ0uJfL/Iwmadz/j2'),
    ('James Chen', 'Lead Quality Inspector', 'Quality Assurance', 'james.chen@aeronetb.com', '+44-20-7946-0002', '$2b$10$fKZ2hGXbgCAbYtEJOVXivucMUJfZ.xsmFqzCmJ0uJfL/Iwmadz/j2'),
    ('Maria Garcia', 'Supply Chain Manager', 'Supply Chain', 'maria.garcia@aeronetb.com', '+44-20-7946-0003', '$2b$10$fKZ2hGXbgCAbYtEJOVXivucMUJfZ.xsmFqzCmJ0uJfL/Iwmadz/j2'),
    ('David Kim', 'Equipment Engineer', 'Engineering', 'david.kim@aeronetb.com', '+44-20-7946-0004', '$2b$10$fKZ2hGXbgCAbYtEJOVXivucMUJfZ.xsmFqzCmJ0uJfL/Iwmadz/j2'),
    ('Emma Wilson', 'Compliance Auditor', 'Compliance', 'emma.wilson@aeronetb.com', '+44-20-7946-0005', '$2b$10$fKZ2hGXbgCAbYtEJOVXivucMUJfZ.xsmFqzCmJ0uJfL/Iwmadz/j2');

-- USER ROLES
INSERT INTO user_role (emp_id, role_id) VALUES
    (1, 1), -- Sarah = ProcurementOfficer
    (2, 2), -- James = QualityInspector
    (3, 3), -- Maria = SupplyChainManager
    (4, 4), -- David = EquipmentEngineer
    (5, 5); -- Emma = Auditor

-- SUPPLIERS
INSERT INTO supplier (business_name, address) VALUES
    ('Titanium Aerospace Ltd', '123 Industrial Park, Sheffield, UK'),
    ('Global Composites Inc', '456 Manufacturing Blvd, Toulouse, France'),
    ('Pacific Alloys Corp', '789 Metal Works Drive, Osaka, Japan'),
    ('Nordic Precision AB', '321 Engineering Way, Stockholm, Sweden'),
    ('Atlas Materials GmbH', '654 Werkstrasse, Munich, Germany');

-- SUPPLIER ACCREDITATIONS (4NF: separated from supplier)
INSERT INTO supplier_accreditation (supplier_id, accreditation_type, issued_date, expiry_date) VALUES
    (1, 'ISO 9001', '2023-01-15', '2026-01-15'),
    (1, 'AS9100', '2023-03-20', '2026-03-20'),
    (2, 'ISO 9001', '2022-06-10', '2025-06-10'),
    (2, 'AS9100', '2022-08-15', '2025-08-15'),
    (2, 'ISO 14001', '2023-01-01', '2026-01-01'),
    (3, 'ISO 9001', '2024-01-01', '2027-01-01'),
    (4, 'AS9100', '2023-05-01', '2026-05-01'),
    (4, 'ISO 9001', '2023-05-01', '2026-05-01'),
    (5, 'ISO 9001', '2024-02-01', '2027-02-01');

-- SUPPLIER CONTACTS (4NF: separated from supplier)
INSERT INTO supplier_contact (supplier_id, contact_name, contact_email, contact_phone, is_primary) VALUES
    (1, 'John Steel', 'j.steel@titaniumaero.com', '+44-114-555-0101', TRUE),
    (1, 'Lisa Brown', 'l.brown@titaniumaero.com', '+44-114-555-0102', FALSE),
    (2, 'Pierre Dupont', 'p.dupont@globalcomp.fr', '+33-5-555-0201', TRUE),
    (3, 'Yuki Tanaka', 'y.tanaka@pacificalloys.jp', '+81-6-555-0301', TRUE),
    (3, 'Kenji Sato', 'k.sato@pacificalloys.jp', '+81-6-555-0302', FALSE),
    (4, 'Erik Lindqvist', 'e.lindqvist@nordicprec.se', '+46-8-555-0401', TRUE),
    (5, 'Hans Mueller', 'h.mueller@atlasmaterials.de', '+49-89-555-0501', TRUE);

-- PARTS
INSERT INTO part (part_name, description, part_category) VALUES
    ('A320 Fuselage Panel', 'Main fuselage structural panel for A320 family', 'Structural'),
    ('Wing Spar Assembly', 'Primary wing load-bearing spar', 'Structural'),
    ('Landing Gear Strut', 'Main landing gear structural component', 'Landing Gear'),
    ('Engine Mount Bracket', 'Titanium engine pylon mounting bracket', 'Propulsion'),
    ('Hydraulic Valve Block', 'Flight control hydraulic distribution valve', 'Systems');

-- SUPPLIER PART OFFERINGS
INSERT INTO supplier_part_offering (supplier_id, part_id, supplier_part_code, customisation_summary, active_flag) VALUES
    (1, 1, 'TA-FP-320-A', 'Anti-corrosion coating + RFID tracking tags', TRUE),
    (2, 1, 'GC-FP-320-B', 'Reinforced composite layering + shock sensors', TRUE),
    (1, 2, 'TA-WS-001', 'Standard titanium alloy spar', TRUE),
    (3, 3, 'PA-LG-001', 'High-strength alloy with digital twin data', TRUE),
    (4, 4, 'NP-EM-001', 'Precision machined with enhanced heat treatment', TRUE),
    (5, 5, 'AM-HV-001', 'Standard hydraulic valve with extended warranty', TRUE);

-- PURCHASE ORDERS
INSERT INTO purchase_order (supplier_id, order_date, desired_delivery_date, actual_delivery_date, status) VALUES
    (1, '2025-01-15', '2025-03-15', '2025-03-12', 'Completed'),
    (2, '2025-02-01', '2025-04-01', '2025-04-05', 'Completed'),
    (3, '2025-03-10', '2025-05-10', NULL, 'Dispatched'),
    (4, '2025-04-01', '2025-06-01', NULL, 'Confirmed'),
    (1, '2025-05-01', '2025-07-01', NULL, 'Placed');

-- ORDER LINES
INSERT INTO purchase_order_line (order_id, supplier_part_id, quantity) VALUES
    (1, 1, 50),
    (1, 3, 20),
    (2, 2, 30),
    (3, 4, 15),
    (4, 5, 25),
    (5, 1, 40);

-- SHIPMENTS
INSERT INTO shipment (order_id, tracking_number, port_of_entry, shipment_status) VALUES
    (1, 'SHP-2025-001', 'Port of London', 'Delivered'),
    (2, 'SHP-2025-002', 'Port of Southampton', 'Delivered'),
    (3, 'SHP-2025-003', 'Port of Rotterdam', 'In Transit'),
    (4, 'SHP-2025-004', 'Port of Hamburg', 'Pending');

-- DELIVERED ITEMS
INSERT INTO delivered_item (order_line_id, shipment_id, serial_number, batch_number, delivery_timestamp) VALUES
    (1, 1, 'SN-FP-001', 'BATCH-2025-Q1-001', '2025-03-12 09:30:00'),
    (2, 1, 'SN-WS-001', 'BATCH-2025-Q1-002', '2025-03-12 09:30:00'),
    (3, 2, 'SN-FP-002', 'BATCH-2025-Q1-003', '2025-04-05 14:15:00');

-- MATERIAL BATCHES
INSERT INTO material_batch (origin_supplier_name, material_type, traceability_data_ref) VALUES
    ('Titanium Aerospace Ltd', 'Ti-6Al-4V Titanium Alloy', '/trace/batch-2025-Q1-001.pdf'),
    ('Global Composites Inc', 'Carbon Fiber Composite T800', '/trace/batch-2025-Q1-002.pdf'),
    ('Pacific Alloys Corp', 'High-Strength Steel 300M', '/trace/batch-2025-Q1-003.pdf');

-- DELIVERED ITEM MATERIALS
INSERT INTO delivered_item_material (delivered_item_id, material_batch_id) VALUES
    (1, 1), (1, 2),
    (2, 1),
    (3, 2);

-- EQUIPMENT
INSERT INTO equipment (equipment_name, facility, equipment_type) VALUES
    ('CNC Mill Station 1', 'Sheffield Plant', 'CNC Milling'),
    ('Autoclave Unit A', 'Toulouse Plant', 'Composite Curing'),
    ('NDT Scanner Bay 1', 'Sheffield Plant', 'Non-Destructive Testing'),
    ('Heat Treatment Furnace', 'Munich Plant', 'Heat Treatment');

-- IOT DEVICES
INSERT INTO iot_device (device_type, assigned_to_type, assigned_to_id, equipment_id) VALUES
    ('MachineSensor', 'Equipment', '1', 1),
    ('MachineSensor', 'Equipment', '2', 2),
    ('ContainerTracker', 'Shipment', '3', NULL),
    ('MachineSensor', 'Equipment', '4', 4);

-- INITIAL AUDIT LOG
INSERT INTO audit_log (emp_id, action_type, entity_type, entity_id, details) VALUES
    (1, 'CREATE', 'PurchaseOrder', '1', 'Created PO for Titanium Aerospace Ltd'),
    (1, 'CREATE', 'PurchaseOrder', '2', 'Created PO for Global Composites Inc'),
    (2, 'CREATE', 'QCReport', 'QC-001', 'Created dimensional inspection report'),
    (2, 'APPROVE', 'Certification', 'CERT-001', 'Approved certification for delivered item 1');
