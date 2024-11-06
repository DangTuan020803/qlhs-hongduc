const express = require("express");
const mongoose = require("mongoose"); // Import mongoose
const router = express.Router();
const Certificate = require("../models/Certificate"); // Adjust the path as necessary
const User = require("../models/User"); // Ensure this is correctly defined

// Function to generate a unique certificate ID
const generateUniqueCertificateId = async () => {
  let id;
  const existingIds = await Certificate.find().distinct("certificateId"); // Get current IDs

  do {
    id = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit number
  } while (existingIds.includes(id)); // Repeat if it already exists

  return id;
};

// GET route to fetch all certificates
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find({});
    res.status(200).json({ certificates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách văn bằng." });
  }
});

// GET route to search for certificates by student name, student ID, or certificate ID
router.get("/search", async (req, res) => {
  const { query } = req.query; // Get the search term from query parameters

  try {
    const searchRegex = new RegExp(query, "i"); // Case insensitive search
    const certificates = await Certificate.find({
      $or: [
        { studentName: searchRegex },
        { studentId: searchRegex },
        { certificateId: searchRegex }
      ]
    });

    res.status(200).json({ certificates });
  } catch (error) {
    console.error("Error searching certificates:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm văn bằng." });
  }
});

// POST route to create a new certificate
router.post("/create", async (req, res) => {
  const {
    studentName,
    studentId,
    course,
    major,
    issueDate,
    degreeType,
    issuingUnit
  } = req.body;

  try {
    // Generate a unique certificate ID
    const certificateId = await generateUniqueCertificateId();

    const newCertificate = new Certificate({
      studentName,
      studentId,
      certificateId,
      course,
      major,
      issueDate: new Date(issueDate), // Convert to Date object
      degreeType,
      issuingUnit,
      status: "New" // Initial status
    });

    const savedCertificate = await newCertificate.save();
    res.status(201).json({ certificate: savedCertificate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cấp văn bằng." });
  }
});

// DELETE route to remove an old certificate
router.delete("/delete/:certificateId", async (req, res) => {
  const { certificateId } = req.params;

  try {
    const deletedCertificate = await Certificate.findOneAndDelete({
      certificateId
    }); // Use certificateId to find and delete
    if (!deletedCertificate) {
      return res.status(404).json({ message: "Văn bằng không tồn tại." });
    }
    res.status(200).json({ message: "Văn bằng đã được xóa thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi xóa văn bằng." });
  }
});

// POST route to reissue a certificate
router.post("/reissue", async (req, res) => {
  const {
    oldCertificateId,
    studentName,
    reissueReason,
    reissueDate,
    reissuingUnit
  } = req.body;

  try {
    // Step 1: Check for the old certificate
    const existingCertificate = await Certificate.findOne({
      certificateId: oldCertificateId
    });
    if (!existingCertificate) {
      return res.status(404).json({ message: "Văn bằng cũ không tồn tại." });
    }

    // Step 2: Delete the old certificate
    await Certificate.deleteOne({ certificateId: oldCertificateId });

    // Step 3: Generate a new unique certificate ID
    const newCertificateId = await generateUniqueCertificateId();

    // Step 4: Create a new reissued certificate
    const newCertificate = new Certificate({
      studentName,
      studentId: existingCertificate.studentId, // Use the same studentId
      certificateId: newCertificateId, // Generate a new unique certificate ID
      course: existingCertificate.course,
      major: existingCertificate.major,
      issueDate: new Date(reissueDate), // Convert to Date object
      degreeType: existingCertificate.degreeType,
      issuingUnit: reissuingUnit,
      status: "Reissued", // Mark as reissued
      oldCertificateId // Add the old certificate ID for reference
    });

    const savedCertificate = await newCertificate.save();
    res.status(201).json({ certificate: savedCertificate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cấp lại văn bằng." });
  }
});

// POST route to get daily issued certificates
router.post("/daily", async (req, res) => {
  const { date } = req.body; // Expect a date in the request body, e.g., { date: "YYYY-MM-DD" }

  try {
    const startDate = new Date(date); // Start of the day
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // End of the day (next day at midnight)

    const dailyCertificates = await Certificate.find({
      issueDate: {
        $gte: startDate,
        $lt: endDate
      }
    });

    res.status(200).json({ certificates: dailyCertificates });
  } catch (error) {
    console.error("Error fetching daily certificates:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách văn bằng đã cấp trong ngày." });
  }
});

// PATCH route for signing certificates
router.patch("/sign/:id", async (req, res) => {
  const { id } = req.params; // Get user ID from the URL parameters
  const { certificateId, status, signature } = req.body; // Expect certificateId and other data in the body

  console.log("Signing endpoint hit with user ID:", id);
  console.log("Certificate ID:", certificateId);
  console.log("Status:", status);
  console.log("Signature:", signature);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    // Check if the user ID is valid
    return res.status(400).json({ message: "ID người dùng không hợp lệ." });
  }

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Find the certificate by certificateId
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ message: "Chứng chỉ không tồn tại." });
    }

    // Update the certificate status and signature
    certificate.status = status; // Update the status to "Đã cấp"
    certificate.signature = signature; // Store the signature if needed
    await certificate.save(); // Save the updated certificate

    res
      .status(200)
      .json({ message: "Trạng thái đã được cập nhật.", certificate });
  } catch (error) {
    console.error("Error updating signing status:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái ký." });
  }
});

module.exports = router;
