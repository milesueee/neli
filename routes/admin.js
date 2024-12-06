const express = require('express');
const router = express.Router();
const fs = require('fs');

// Helper function to load licenses from JSON file
function loadLicenses() {
    try {
        const data = fs.readFileSync('licenses.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {}; // If the file doesn't exist or is empty, return an empty object
    }
}

// Helper function to save licenses to JSON file
function saveLicenses(licenses) {
    fs.writeFileSync('licenses.json', JSON.stringify(licenses, null, 2), 'utf8');
}

// Route to render the admin dashboard with all licenses
router.get('/', (req, res) => {
    const licenses = loadLicenses(); // Load licenses from the JSON file
    res.render('admin', { licenses }); // Pass the licenses data to the view
});

// Route to create a new license
router.post('/create', (req, res) => {
    const { name, usageLimit } = req.body;

    // Check if name and usageLimit are provided
    if (!name || !usageLimit) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const licenseKey = generateLicenseKey();
    const licenses = loadLicenses();
    licenses[licenseKey] = { name, usageLimit, usedCount: 0, revoked: false };
    saveLicenses(licenses);

    // Redirect back to the admin page after generating a license
    res.redirect('/admin');
});

// Route to revoke a license
router.post('/revoke/:licenseKey', (req, res) => {
    const { licenseKey } = req.params;
    const licenses = loadLicenses();

    if (!licenses[licenseKey]) {
        return res.status(404).json({ success: false, message: 'License not found.' });
    }

    licenses[licenseKey].revoked = true;
    saveLicenses(licenses);

    res.json({ success: true, message: 'License revoked successfully.' });
});

// Helper function to generate a random license key
function generateLicenseKey() {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
}

module.exports = router;
