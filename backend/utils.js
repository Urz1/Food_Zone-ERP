const crypto = require('crypto');

/**
 * Generate a unique license key
 * Format: FOOD-XXXX-XXXX-XXXX
 */
function generateLicenseKey() {
    const segments = [];

    // First segment: FOOD (product identifier)
    segments.push('FOOD');

    // Next 3 segments: Random alphanumeric
    for (let i = 0; i < 3; i++) {
        const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
        segments.push(segment);
    }

    return segments.join('-');
}

/**
 * Validate license key format
 */
function isValidLicenseFormat(licenseKey) {
    // Format: FOOD-XXXX-XXXX-XXXX
    const pattern = /^FOOD-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    return pattern.test(licenseKey);
}

/**
 * Generate multiple license keys at once
 */
function generateBulkLicenses(count) {
    const licenses = [];
    for (let i = 0; i < count; i++) {
        licenses.push(generateLicenseKey());
    }
    return licenses;
}

/**
 * Calculate expiry date for subscription
 */
function calculateExpiryDate(months) {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    return expiryDate.toISOString();
}

module.exports = {
    generateLicenseKey,
    isValidLicenseFormat,
    generateBulkLicenses,
    calculateExpiryDate
};
