const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to the licenses JSON file
const LICENSES_FILE_PATH = path.join(__dirname, '../licenses.json');

// Helper function to load the licenses from the JSON file
function loadLicenses() {
    try {
        const data = fs.readFileSync(LICENSES_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return {}; // If file doesn't exist, return an empty object
    }
}

// Helper function to save the licenses to the JSON file
function saveLicenses(licenses) {
    fs.writeFileSync(LICENSES_FILE_PATH, JSON.stringify(licenses, null, 2));
}

// Route to verify a license
router.post('/verify', (req, res) => {
    const { key, fingerprint } = req.body;
    const licenses = loadLicenses();

    if (!licenses[key]) {
        return res.status(404).json({ success: false, message: 'License not found.' });
    }

    if (licenses[key].revoked) {
        return res.status(400).json({ success: false, message: 'License is revoked.' });
    }

    if (licenses[key].usedCount >= licenses[key].usageLimit) {
        return res.status(400).json({ success: false, message: 'License usage limit reached.' });
    }

    // Increment the used count for the license and save the updated data
    licenses[key].usedCount += 1;
    saveLicenses(licenses);

    res.json({ success: true, message: 'License verified.' });
});

module.exports = router;
