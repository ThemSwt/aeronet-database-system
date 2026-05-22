-- ============================================
-- AeroNetB Aerospace - 4NF PostgreSQL Schema
-- ============================================

-- DOMAIN 1: MASTER DATA
-- =====================

CREATE TABLE supplier (
    supplier_id SERIAL PRIMARY KEY,
    business_name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4NF: Accreditations separated (supplier can hold MULTIPLE: ISO9001, AS9100, etc.)
CREATE TABLE supplier_accreditation (
    accreditation_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(supplier_id) ON DELETE CASCADE,
    accreditation_type VARCHAR(100) NOT NULL,
    issued_date DATE,
    expiry_date DATE
);

-- 4NF: Contacts separated (supplier can have MULTIPLE contact persons)
CREATE TABLE supplier_contact (
    contact_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(supplier_id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE part (
    part_id SERIAL PRIMARY KEY,
    part_name VARCHAR(200) NOT NULL,
    description TEXT,
    part_category VARCHAR(100)
);

CREATE TABLE supplier_part_offering (
    supplier_part_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(supplier_id),
    part_id INT REFERENCES part(part_id),
    supplier_part_code VARCHAR(50),
    customisation_summary TEXT,
    active_flag BOOLEAN DEFAULT TRUE
);

-- DOMAIN 2: TRANSACTIONAL OPERATIONS
-- ===================================

CREATE TABLE purchase_order (
    order_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(supplier_id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    desired_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(20) DEFAULT 'Placed' 
        CHECK (status IN ('Placed','Confirmed','Dispatched','Delivered','Completed'))
);

CREATE TABLE purchase_order_line (
    order_line_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES purchase_order(order_id) ON DELETE CASCADE,
    supplier_part_id INT REFERENCES supplier_part_offering(supplier_part_id),
    quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE shipment (
    shipment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES purchase_order(order_id),
    tracking_number VARCHAR(100),
    port_of_entry VARCHAR(100),
    shipment_status VARCHAR(50) DEFAULT 'In Transit'
);

-- DOMAIN 3: QUALITY & COMPLIANCE (relational parts)
-- ==================================================

CREATE TABLE delivered_item (
    delivered_item_id SERIAL PRIMARY KEY,
    order_line_id INT REFERENCES purchase_order_line(order_line_id),
    shipment_id INT REFERENCES shipment(shipment_id),
    serial_number VARCHAR(50),
    batch_number VARCHAR(50),
    delivery_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_batch (
    material_batch_id SERIAL PRIMARY KEY,
    origin_supplier_name VARCHAR(200),
    material_type VARCHAR(100),
    traceability_data_ref VARCHAR(500)
);

CREATE TABLE delivered_item_material (
    id SERIAL PRIMARY KEY,
    delivered_item_id INT REFERENCES delivered_item(delivered_item_id),
    material_batch_id INT REFERENCES material_batch(material_batch_id)
);

-- DOMAIN 5: IDENTITY, ROLES & AUDITING
-- =====================================

CREATE TABLE user_account (
    emp_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE user_role (
    user_role_id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES user_account(emp_id) ON DELETE CASCADE,
    role_id INT REFERENCES role(role_id) ON DELETE CASCADE,
    UNIQUE(emp_id, role_id)
);

CREATE TABLE permission (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) NOT NULL,
    scope VARCHAR(100) NOT NULL
);

CREATE TABLE role_permission (
    role_permission_id SERIAL PRIMARY KEY,
    role_id INT REFERENCES role(role_id) ON DELETE CASCADE,
    permission_id INT REFERENCES permission(permission_id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

CREATE TABLE audit_log (
    audit_id SERIAL PRIMARY KEY,
    emp_id INT REFERENCES user_account(emp_id),
    action_type VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    outcome VARCHAR(10) DEFAULT 'Success'
);

-- DOMAIN 4: EQUIPMENT & IoT (registry only, readings in MongoDB)
-- ===============================================================

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(200) NOT NULL,
    facility VARCHAR(100),
    equipment_type VARCHAR(100)
);

CREATE TABLE iot_device (
    device_id SERIAL PRIMARY KEY,
    device_type VARCHAR(50),
    assigned_to_type VARCHAR(20),
    assigned_to_id VARCHAR(50),
    equipment_id INT REFERENCES equipment(equipment_id)
);
