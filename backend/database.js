const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'licenses.db');

// Global database instance
let db = null;

// Initialize sql.js database
async function initializeDatabase() {
    try {
        const SQL = await initSqlJs();

        // Load existing database or create new one
        if (fs.existsSync(dbPath)) {
            const buffer = fs.readFileSync(dbPath);
            db = new SQL.Database(buffer);
            console.log('✅ Loaded existing database');
        } else {
            db = new SQL.Database();
            console.log('✅ Created new database');
        }

        // Create tables if they don't exist
        db.run(`
      CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT UNIQUE NOT NULL,
        business_name TEXT,
        device_id TEXT,
        device_info TEXT,
        status TEXT DEFAULT 'pending',
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        activated_at DATETIME,
        last_verified_at DATETIME
      )
    `);

        db.run(`
      CREATE TABLE IF NOT EXISTS activation_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT NOT NULL,
        device_id TEXT NOT NULL,
        device_info TEXT,
        business_name TEXT,
        success INTEGER DEFAULT 0,
        error_message TEXT,
        ip_address TEXT,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        db.run(`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT NOT NULL,
        device_id TEXT NOT NULL,
        verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Save initial database
        saveDatabase();

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

// Save database to disk
function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

// Execute a query and return results
function executeQuery(sql, params = []) {
    if (!db) throw new Error('Database not initialized');
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
}

// Execute a query without returning results (INSERT, UPDATE, DELETE)
function executeRun(sql, params = []) {
    if (!db) throw new Error('Database not initialized');
    db.run(sql, params);
    saveDatabase();
}

// License operations
const licenseDB = {
    // Create a new license
    createLicense: (licenseKey, expiresAt = null) => {
        try {
            executeRun(
                'INSERT INTO licenses (license_key, status, expires_at) VALUES (?, ?, ?)',
                [licenseKey, 'pending', expiresAt]
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get license by key
    getLicense: (licenseKey) => {
        const results = executeQuery(
            'SELECT * FROM licenses WHERE license_key = ?',
            [licenseKey]
        );
        return results.length > 0 ? results[0] : null;
    },

    // Activate a license
    activateLicense: (licenseKey, deviceId, deviceInfo, businessName) => {
        const license = licenseDB.getLicense(licenseKey);

        // Check if license exists
        if (!license) {
            return { success: false, error: 'License key not found' };
        }

        // Check if license is expired
        if (license.expires_at) {
            const expiryDate = new Date(license.expires_at);
            if (expiryDate < new Date()) {
                return { success: false, error: 'License has expired' };
            }
        }

        // Check if already activated on a different device
        if (license.status === 'active' && license.device_id !== deviceId) {
            // Log failed attempt
            licenseDB.logActivationAttempt(
                licenseKey,
                deviceId,
                deviceInfo,
                businessName,
                false,
                'License already activated on another device'
            );

            return {
                success: false,
                error: 'License already activated on another device',
                hint: 'Contact support to transfer license'
            };
        }

        // Check if same device (allow re-activation)
        if (license.status === 'active' && license.device_id === deviceId) {
            licenseDB.updateLastVerified(licenseKey);
            return {
                success: true,
                message: 'License already activated on this device',
                expiresAt: license.expires_at
            };
        }

        // Activate the license
        try {
            executeRun(
                `UPDATE licenses
         SET status = 'active',
             device_id = ?,
             device_info = ?,
             business_name = ?,
             activated_at = CURRENT_TIMESTAMP,
             last_verified_at = CURRENT_TIMESTAMP
         WHERE license_key = ?`,
                [deviceId, JSON.stringify(deviceInfo), businessName, licenseKey]
            );

            // Log successful activation
            licenseDB.logActivationAttempt(
                licenseKey,
                deviceId,
                deviceInfo,
                businessName,
                true,
                null
            );

            return {
                success: true,
                message: 'License activated successfully',
                expiresAt: license.expires_at
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Verify a license (called frequently by app)
    verifyLicense: (licenseKey, deviceId) => {
        const license = licenseDB.getLicense(licenseKey);

        if (!license) {
            return { valid: false, error: 'License not found' };
        }

        if (license.status !== 'active') {
            return { valid: false, error: 'License not activated' };
        }

        if (license.device_id !== deviceId) {
            return { valid: false, error: 'Device mismatch' };
        }

        // Check expiry
        if (license.expires_at) {
            const expiryDate = new Date(license.expires_at);
            if (expiryDate < new Date()) {
                return { valid: false, error: 'License expired' };
            }
        }

        // Update last verified timestamp
        licenseDB.updateLastVerified(licenseKey);

        // Log verification
        licenseDB.logVerification(licenseKey, deviceId);

        return {
            valid: true,
            businessName: license.business_name,
            expiresAt: license.expires_at
        };
    },

    // Deactivate a license (for device transfer)
    deactivateLicense: (licenseKey) => {
        try {
            executeRun(
                `UPDATE licenses
         SET status = 'pending',
             device_id = NULL,
             device_info = NULL
         WHERE license_key = ?`,
                [licenseKey]
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update last verified timestamp
    updateLastVerified: (licenseKey) => {
        executeRun(
            'UPDATE licenses SET last_verified_at = CURRENT_TIMESTAMP WHERE license_key = ?',
            [licenseKey]
        );
    },

    // Log activation attempts
    logActivationAttempt: (licenseKey, deviceId, deviceInfo, businessName, success, errorMessage) => {
        executeRun(
            `INSERT INTO activation_attempts
       (license_key, device_id, device_info, business_name, success, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                licenseKey,
                deviceId,
                JSON.stringify(deviceInfo),
                businessName,
                success ? 1 : 0,
                errorMessage
            ]
        );
    },

    // Log verification
    logVerification: (licenseKey, deviceId) => {
        executeRun(
            'INSERT INTO verification_logs (license_key, device_id) VALUES (?, ?)',
            [licenseKey, deviceId]
        );
    },

    // Get all licenses (admin)
    getAllLicenses: () => {
        return executeQuery('SELECT * FROM licenses ORDER BY created_at DESC');
    },

    // Get activation attempts (admin - for security)
    getActivationAttempts: (limit = 100) => {
        return executeQuery(
            'SELECT * FROM activation_attempts ORDER BY attempted_at DESC LIMIT ?',
            [limit]
        );
    },

    // Get suspicious activity (multiple failed attempts)
    getSuspiciousActivity: () => {
        return executeQuery(`
      SELECT license_key, device_id, COUNT(*) as attempt_count
      FROM activation_attempts
      WHERE success = 0
      GROUP BY license_key, device_id
      HAVING attempt_count > 3
      ORDER BY attempt_count DESC
    `);
    }
};

module.exports = { initializeDatabase, licenseDB, db };
