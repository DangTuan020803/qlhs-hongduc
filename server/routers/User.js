const express = require("express");
const { login } = require("../controllers/User");
const router = express.Router();

router.post("/api/login", login);

module.exports = router;
