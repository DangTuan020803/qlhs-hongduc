const bcrypt = require("bcrypt");
const User = require("../models/User"); // Adjust the import path as necessary

const login = async (req, res) => {
  const { username, password } = req.body; // Get the username and password from the request body

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Tên đăng nhập và mật khẩu là bắt buộc." });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    // If the passwords match, generate a token or perform the necessary login actions
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi, vui lòng thử lại sau." });
  }
};

module.exports = {
  login
};
