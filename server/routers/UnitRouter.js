const express = require("express");
const router = express.Router();
const Unit = require("../models/Unit"); // Assuming you've set up a Unit model

// Get all units
router.get("/list", async (req, res) => {
  try {
    const units = await Unit.find();
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn vị." });
  }
});

// Create a new unit
router.post("/create", async (req, res) => {
  const { unitName, unitType } = req.body;
  try {
    const newUnit = new Unit({ unitName, unitType });
    await newUnit.save();
    res.status(201).json(newUnit);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm đơn vị mới." });
  }
});

// Update an existing unit
router.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { unitName, unitType } = req.body;
  try {
    const updatedUnit = await Unit.findByIdAndUpdate(
      id,
      { unitName, unitType },
      { new: true }
    );
    if (updatedUnit) {
      res.json(updatedUnit);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn vị." });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật đơn vị." });
  }
});

// Delete a unit
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Unit.findByIdAndDelete(id);
    res.json({ message: "Đơn vị đã được xóa thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đơn vị." });
  }
});
// Get units created in a specific month
router.get("/monthly", async (req, res) => {
  const { year, month } = req.query; // Expecting year and month as query parameters

  try {
    // Validate year and month
    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required." });
    }

    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript
    const endDate = new Date(year, month, 1); // The first day of the next month

    // Fetch units created within the specified month
    const monthlyUnits = await Unit.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    });

    res.status(200).json({ units: monthlyUnits });
  } catch (error) {
    console.error("Error fetching monthly units:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách đơn vị theo tháng." });
  }
});
module.exports = router;
