const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true // Ensure that each certificate has a unique identifier
  },
  course: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  degreeType: {
    type: String,
    required: true,
    enum: ["cu-nhan", "thac-si", "tien-si"] // Add more degree types if needed
  },
  issuingUnit: {
    type: String,
    required: true,
    enum: ["phong-dao-tao", "ban-giam-hieu"] // Add more issuing units if needed
  },
  status: {
    type: String,
    required: true,
    default: "New", // Set the default status to "New"
    enum: ["New", "Reissued", "Đã cấp", "Chưa cấp"] // Updated status options
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  oldCertificateId: {
    type: String, // This will store the ID of the original certificate if this one is a reissue
    default: null // Default value can be null, as it may not always be applicable
  },
  signature: {
    // Add this field
    type: String, // Adjust type according to how you want to store the signature
    default: null
  }
});

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;
