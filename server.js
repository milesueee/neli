const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const basicAuth = require('express-basic-auth');

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // To handle form data

// Set up basic authentication for admin routes
const adminPassword = 'jching15406';  // Replace with your own password
app.use('/admin', basicAuth({
    users: { 'milesueee': adminPassword },
    challenge: true,
    realm: 'Admin Area'
}));

// Path to the licenses JSON file
const LICENSES_FILE_PATH = path.join(__dirname, 'licenses.json');

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
app.post('/api/verify', (req, res) => {
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

// Route to serve the admin dashboard (admin.ejs)
app.get('/admin', (req, res) => {
    const licenses = loadLicenses();
    res.render('admin', { licenses });
});

// Route to create a new license
app.post('/admin/create', (req, res) => {
    const { name, usageLimit } = req.body;
    const key = generateLicenseKey();
    const licenses = loadLicenses();

    licenses[key] = {
        name,
        usageLimit,
        usedCount: 0,
        revoked: false
    };

    saveLicenses(licenses);

    // After creating the license, redirect to the admin page with updated data
    res.redirect('/admin');
});

// Route to revoke a license
app.post('/admin/revoke/:key', (req, res) => {
    const key = req.params.key;
    const licenses = loadLicenses();

    if (!licenses[key]) {
        return res.status(404).json({ success: false, message: 'License not found.' });
    }

    licenses[key].revoked = true;
    saveLicenses(licenses);

    res.redirect('/admin');
});

// Helper function to generate a random license key
function generateLicenseKey() {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
}

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
