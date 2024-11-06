// // const mongoose = require("mongoose");

// // const userSchema = new mongoose.Schema({
// //   username: { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// //   role: { type: String, enum: ["admin", "user", "student"] }
// // });
// // module.exports = mongoose.model("User", userSchema);
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true }, // Họ và tên người dùng
//   email: { type: String, required: true, unique: true }, // Email người dùng
//   studentId: { type: String, unique: true, sparse: true }, // Mã sinh viên, chỉ dùng cho sinh viên (optional)
//   password: { type: String, required: true }, // Mật khẩu người dùng (được mã hóa)
//   role: { type: String, required: true, enum: ["admin", "user", "student"] }, // Vai trò người dùng
//   status: { type: String, default: "active" } // Thêm trạng thái active/inactive,
// });

// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Họ và tên người dùng
  email: { type: String, required: true, unique: true }, // Email người dùng
  password: { type: String, required: true }, // Mật khẩu
  role: { type: String, required: true, enum: ["admin", "user", "student"] }, // Vai trò
  status: { type: String, default: "Active" }, // Trạng thái
  publicKey: { type: String, required: true }, // Khóa công khai (public key)
  privateKey: { type: String, required: true } // Khóa bí mật (private key)
});

module.exports = mongoose.model("User", userSchema);
