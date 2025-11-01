const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'licenses.db'));

// Create tables if they don't exist
function initializeDatabase() {
    // Licenses table
    db.exec(`
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

    // Activation attempts log (for security monitoring)
    db.exec(`
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

    // Verification logs (track license checks)
    db.exec(`
    CREATE TABLE IF NOT EXISTS verification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT NOT NULL,
      device_id TEXT NOT NULL,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('✅ Database initialized successfully');
}

// License operations
const licenseDB = {
    // Create a new license
    createLicense: (licenseKey, expiresAt = null) => {
        const stmt = db.prepare(`
      INSERT INTO licenses (license_key, status, expires_at)
      VALUES (?, 'pending', ?)
    `);

        try {
            const result = stmt.run(licenseKey, expiresAt);
            return { success: true, id: result.lastInsertRowid };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get license by key
    getLicense: (licenseKey) => {
        const stmt = db.prepare(`
      SELECT * FROM licenses WHERE license_key = ?
    `);
        return stmt.get(licenseKey);
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
        const stmt = db.prepare(`
      UPDATE licenses
      SET status = 'active',
          device_id = ?,
          device_info = ?,
          business_name = ?,
          activated_at = CURRENT_TIMESTAMP,
          last_verified_at = CURRENT_TIMESTAMP
      WHERE license_key = ?
    `);

        try {
            stmt.run(deviceId, JSON.stringify(deviceInfo), businessName, licenseKey);

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
        const stmt = db.prepare(`
      UPDATE licenses
      SET status = 'pending',
          device_id = NULL,
          device_info = NULL
      WHERE license_key = ?
    `);

        try {
            stmt.run(licenseKey);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update last verified timestamp
    updateLastVerified: (licenseKey) => {
        const stmt = db.prepare(`
      UPDATE licenses
      SET last_verified_at = CURRENT_TIMESTAMP
      WHERE license_key = ?
    `);
        stmt.run(licenseKey);
    },

    // Log activation attempts
    logActivationAttempt: (licenseKey, deviceId, deviceInfo, businessName, success, errorMessage) => {
        const stmt = db.prepare(`
      INSERT INTO activation_attempts
      (license_key, device_id, device_info, business_name, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            licenseKey,
            deviceId,
            JSON.stringify(deviceInfo),
            businessName,
            success ? 1 : 0,
            errorMessage
        );
    },

    // Log verification
    logVerification: (licenseKey, deviceId) => {
        const stmt = db.prepare(`
      INSERT INTO verification_logs (license_key, device_id)
      VALUES (?, ?)
    `);
        stmt.run(licenseKey, deviceId);
    },

    // Get all licenses (admin)
    getAllLicenses: () => {
        const stmt = db.prepare(`
      SELECT * FROM licenses ORDER BY created_at DESC
    `);
        return stmt.all();
    },

    // Get activation attempts (admin - for security)
    getActivationAttempts: (limit = 100) => {
        const stmt = db.prepare(`
      SELECT * FROM activation_attempts
      ORDER BY attempted_at DESC
      LIMIT ?
    `);
        return stmt.all(limit);
    },

    // Get suspicious activity (multiple failed attempts)
    getSuspiciousActivity: () => {
        const stmt = db.prepare(`
      SELECT license_key, device_id, COUNT(*) as attempt_count
      FROM activation_attempts
      WHERE success = 0
      GROUP BY license_key, device_id
      HAVING attempt_count > 3
      ORDER BY attempt_count DESC
    `);
        return stmt.all();
    }
};

module.exports = { initializeDatabase, licenseDB, db };
