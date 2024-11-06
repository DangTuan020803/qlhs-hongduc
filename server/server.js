const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User"); // Ensure this is correctly defined
const certificateRoutes = require("./routers/Certificate");
const userRoute = require("./routers/UseRouter");
const unitRoutes = require("./routers/UnitRouter");
const Progress = require("./routers/Progress");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/certificates", certificateRoutes);
app.use("/api/users", userRoute); // Route cho người dùng
app.use("/api/units", unitRoutes);
app.use("/api/progress", Progress);
// Function to start the server
const startServer = async () => {
  const api =
    "mongodb+srv://trinhdangtuan2003:MIP5gTLZF0ZC9WgT@cluster0.y4jbh.mongodb.net/qlvb--hongduc?retryWrites=true&w=majority&appName=Cluster0";

  try {
    // Establish a connection to the database
    await mongoose.connect(api);
    console.log("Kết nối tới CSDL thành công");

    // Create the admin user after DB connection
    await createAdminUser();

    // Start the server only after successful DB connection and user creation
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Kết nối không thành công:", error);
  }
};

// Function to create an admin user
const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10); // Mã hóa mật khẩu
      const admin = new User({
        username: "admin",
        email: "admin@example.com", // Thêm email cho admin
        password: hashedPassword,
        role: "admin",
        status: "active" // Thêm trạng thái cho admin nếu cần
      });
      console.log("Admin user object:", admin); // Kiểm tra đối tượng admin
      await admin.save(); // Lưu người dùng vào CSDL
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const authenticateToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// Route để lấy thông tin người dùng hiện tại
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Bỏ mật khẩu khi trả về
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// Start the server
startServer();
