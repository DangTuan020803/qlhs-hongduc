const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User"); // Ensure you have a User model defined
const router = express.Router();

// Tạo người dùng mới
router.post("/create", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Kiểm tra nếu email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo cặp khóa công khai và riêng tư RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
      }
    });

    // Tạo một người dùng mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      publicKey,
      privateKey,
      status: "active" // Đặt trạng thái mặc định là active
    });

    await newUser.save();
    res.status(201).json({
      message: "Người dùng mới đã được tạo thành công!",
      userId: newUser._id,
      publicKey: publicKey,
      privateKey: privateKey // Trả về khóa bí mật (cần cẩn thận với điều này)
    });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    res.status(500).json({ message: "Lỗi khi tạo người dùng." });
  }
});

// Lấy danh sách tất cả người dùng
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Không bao gồm mật khẩu trong phản hồi
    res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng." });
  }
});

// Cập nhật chi tiết người dùng
router.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, role, currentPassword, newPassword } = req.body;

  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Kiểm tra mật khẩu hiện tại nếu có yêu cầu cập nhật mật khẩu
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mật khẩu hiện tại không đúng." });
      }

      // Mã hóa mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword; // Cập nhật mật khẩu
    }

    // Cập nhật các trường khác nếu có
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save(); // Lưu các thay đổi

    res.status(200).json({ message: "Người dùng đã được cập nhật!", user });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng." });
  }
});

// Xóa người dùng theo ID
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    if (userToDelete.role === "admin") {
      return res.status(403).json({
        message: "Không thể xóa tài khoản có quyền Quản trị viên (admin)!."
      });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Người dùng đã được xóa thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi khi xóa người dùng." });
  }
});

// Xác minh mật khẩu cho một người dùng
router.post("/verify-password/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng." });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Lỗi khi xác minh mật khẩu:", error);
    res.status(500).json({ message: "Lỗi khi xác minh mật khẩu." });
  }
});

// Yêu cầu đặt lại mật khẩu (cho mật khẩu đã quên)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }

    // Logic để gửi email với liên kết/token đặt lại mật khẩu nên được thực hiện ở đây.

    res.status(200).json({
      message: "Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn."
    });
  } catch (error) {
    console.error("Lỗi khi gửi email đặt lại mật khẩu:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi gửi hướng dẫn đặt lại mật khẩu." });
  }
});

// Lấy khóa bí mật cho một người dùng
router.get("/:id/private-key", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Trả về khóa bí mật
    res.status(200).json({ privateKey: user.privateKey.trim() });
  } catch (error) {
    console.error("Lỗi khi lấy khóa bí mật:", error);
    res.status(500).json({ message: "Lỗi khi lấy khóa bí mật." });
  }
});
router.get("/distribution", async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users
    const userCount = users.length;

    // Count the number of admin and regular users
    const adminCount = users.filter(user => user.role === "admin").length;
    const regularCount = userCount - adminCount; // Remaining users are regular

    // Respond with the distribution
    res
      .status(200)
      .json([
        { type: "Quản trị viên", value: adminCount },
        { type: "Người dùng", value: regularCount }
      ]);
  } catch (error) {
    console.error("Lỗi khi lấy phân bố người dùng:", error);
    res.status(500).json({ message: "Lỗi khi lấy phân bố người dùng." });
  }
});

// Xác minh mật khẩu cho một người dùng
router.get("/:id/password", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Return the user's hashed password (or some secure way to verify it)
    res.status(200).json({ password: user.password });
  } catch (error) {
    console.error("Lỗi khi lấy mật khẩu:", error);
    res.status(500).json({ message: "Lỗi khi lấy mật khẩu." });
  }
});

module.exports = router;
