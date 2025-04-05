const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  businessType: { type: String, required: true },
  industry: { type: String, required: true },
  loan: { type: String, required: true },
  requirements: {
    land: { selected: Boolean, cost: String },
    building: { selected: Boolean, cost: String },
    machinery: { selected: Boolean, cost: String },
    computers: { selected: Boolean, cost: String },
    furniture: { selected: Boolean, cost: String },
    electrification: { selected: Boolean, cost: String },
    storage: { selected: Boolean, cost: String },
    transportation: { selected: Boolean, cost: String },
    installation: { selected: Boolean, cost: String },
    other: { selected: Boolean, cost: String }
  },
  monthlyExpenses: {
    rent: { selected: Boolean, cost: String },
    salary: { selected: Boolean, cost: String },
    consumables: { selected: Boolean, cost: String },
    stationary: { selected: Boolean, cost: String },
    utilities: { selected: Boolean, cost: String },
    maintenance: { selected: Boolean, cost: String },
    transportation: { selected: Boolean, cost: String },
    communication: { selected: Boolean, cost: String },
    marketing: { selected: Boolean, cost: String },
    miscellaneous: { selected: Boolean, cost: String }
  },
  personalInfo: {
    ownerName: String,
    gender: String,
    education: String,
    category: String,
    businessStart: String
  },
  businessInfo: {
    address: String,
    locality: String,
    panchayath: String,
    town: String,
    pincode: String,
    registrationType: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Pending'],
    default: 'In Progress'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FormData', formDataSchema);
