// routers/userRoutes.js
const express = require("express");
const User = require("../models/User"); // Đảm bảo model được định nghĩa đúng
const router = express.Router();

// Route để lấy danh sách người dùng chưa ký
router.get("/users-to-sign", async (req, res) => {
  try {
    // Tìm tất cả người dùng với trạng thái "Chưa ký"
    const users = await User.find({ status: "Chưa ký" }).select("-password"); // Loại bỏ mật khẩu khỏi kết quả

    // Kiểm tra nếu không có người dùng nào cần ký
    if (users.length === 0) {
      return res
        .status(200)
        .json({ message: "Không có người dùng nào cần ký." });
    }

    // Trả về danh sách người dùng
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users to sign:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng." });
  }
});

// Route để cập nhật trạng thái ký của người dùng
router.patch("/sign/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    // Cập nhật trạng thái người dùng thành "Đã ký" và lưu chữ ký
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: "Đã ký", signature },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res
      .status(200)
      .json({ message: "Người dùng đã ký thành công!", user: updatedUser });
  } catch (error) {
    console.error("Error updating signing status:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái ký." });
  }
});

module.exports = router;
