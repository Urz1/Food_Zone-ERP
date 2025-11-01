require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, licenseDB } = require('./database');
const { generateLicenseKey, isValidLicenseFormat, generateBulkLicenses, calculateExpiryDate } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initializeDatabase();

// ============================================
// PUBLIC API ENDPOINTS (Used by Mobile App)
// ============================================

/**
 * POST /api/license/activate
 * Activate a license key
 */
app.post('/api/license/activate', (req, res) => {
    const { licenseKey, deviceId, deviceInfo, businessName } = req.body;

    // Validation
    if (!licenseKey || !deviceId || !businessName) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: licenseKey, deviceId, businessName'
        });
    }

    if (!isValidLicenseFormat(licenseKey)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid license key format'
        });
    }

    // Activate license
    const result = licenseDB.activateLicense(
        licenseKey,
        deviceId,
        deviceInfo || {},
        businessName
    );

    if (result.success) {
        return res.json(result);
    } else {
        return res.status(400).json(result);
    }
});

/**
 * POST /api/license/verify
 * Verify if a license is valid
 */
app.post('/api/license/verify', (req, res) => {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
        return res.status(400).json({
            valid: false,
            error: 'Missing required fields: licenseKey, deviceId'
        });
    }

    const result = licenseDB.verifyLicense(licenseKey, deviceId);
    res.json(result);
});

/**
 * POST /api/license/check
 * Check license status without logging (lightweight)
 */
app.post('/api/license/check', (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
        return res.status(400).json({
            exists: false,
            error: 'License key required'
        });
    }

    const license = licenseDB.getLicense(licenseKey);

    if (!license) {
        return res.json({
            exists: false,
            message: 'License not found'
        });
    }

    res.json({
        exists: true,
        status: license.status,
        businessName: license.business_name,
        expiresAt: license.expires_at
    });
});

// ============================================
// ADMIN API ENDPOINTS (For You to Manage)
// ============================================

/**
 * Simple authentication middleware
 */
function adminAuth(req, res, next) {
    const { username, password } = req.headers;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

/**
 * POST /api/admin/licenses/generate
 * Generate new license keys
 */
app.post('/api/admin/licenses/generate', adminAuth, (req, res) => {
    const { count = 1, subscriptionMonths = null } = req.body;

    const licenses = [];
    const expiresAt = subscriptionMonths ? calculateExpiryDate(subscriptionMonths) : null;

    for (let i = 0; i < count; i++) {
        const licenseKey = generateLicenseKey();
        const result = licenseDB.createLicense(licenseKey, expiresAt);

        if (result.success) {
            licenses.push({
                licenseKey,
                expiresAt,
                id: result.id
            });
        }
    }

    res.json({
        success: true,
        count: licenses.length,
        licenses
    });
});

/**
 * GET /api/admin/licenses
 * Get all licenses
 */
app.get('/api/admin/licenses', adminAuth, (req, res) => {
    const licenses = licenseDB.getAllLicenses();
    res.json({
        success: true,
        count: licenses.length,
        licenses
    });
});

/**
 * GET /api/admin/attempts
 * Get activation attempts (security monitoring)
 */
app.get('/api/admin/attempts', adminAuth, (req, res) => {
    const attempts = licenseDB.getActivationAttempts(100);
    res.json({
        success: true,
        attempts
    });
});

/**
 * GET /api/admin/suspicious
 * Get suspicious activity
 */
app.get('/api/admin/suspicious', adminAuth, (req, res) => {
    const suspicious = licenseDB.getSuspiciousActivity();
    res.json({
        success: true,
        suspicious
    });
});

/**
 * POST /api/admin/licenses/deactivate
 * Deactivate a license (for device transfer)
 */
app.post('/api/admin/licenses/deactivate', adminAuth, (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
        return res.status(400).json({
            success: false,
            error: 'License key required'
        });
    }

    const result = licenseDB.deactivateLicense(licenseKey);
    res.json(result);
});

/**
 * GET /api/admin/stats
 * Get statistics
 */
app.get('/api/admin/stats', adminAuth, (req, res) => {
    const allLicenses = licenseDB.getAllLicenses();

    const stats = {
        total: allLicenses.length,
        active: allLicenses.filter(l => l.status === 'active').length,
        pending: allLicenses.filter(l => l.status === 'pending').length,
        expired: allLicenses.filter(l => {
            if (!l.expires_at) return false;
            return new Date(l.expires_at) < new Date();
        }).length
    };

    res.json({
        success: true,
        stats
    });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Food Zone ERP License Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            public: [
                'POST /api/license/activate',
                'POST /api/license/verify',
                'POST /api/license/check'
            ],
            admin: [
                'POST /api/admin/licenses/generate',
                'GET /api/admin/licenses',
                'GET /api/admin/attempts',
                'GET /api/admin/suspicious',
                'POST /api/admin/licenses/deactivate',
                'GET /api/admin/stats'
            ]
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Food Zone ERP License Server');
    console.log('================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    console.log(`✅ Database initialized`);
    console.log('');
    console.log('📡 API Endpoints:');
    console.log(`   http://localhost:${PORT}/api/license/activate`);
    console.log(`   http://localhost:${PORT}/api/license/verify`);
    console.log(`   http://localhost:${PORT}/api/admin/licenses/generate`);
    console.log('');
    console.log('💡 Admin credentials from .env file');
    console.log('');
});

module.exports = app;
