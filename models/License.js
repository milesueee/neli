const mongoose = require('mongoose');

// License schema
const licenseSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    revoked: { type: Boolean, default: false }
});

// Check if the model is already compiled, if not, compile it.
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

module.exports = License;
