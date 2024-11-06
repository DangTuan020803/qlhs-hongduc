const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: true,
      trim: true
    },
    unitType: {
      type: String,
      required: true,
      enum: ["phong-dao-tao", "phong-dam-bao-chat-luong", "ban-giam-hieu"],
      trim: true
    }
  },
  { timestamps: true }
); // `timestamps` adds `createdAt` and `updatedAt` fields

const Unit = mongoose.model("Unit", unitSchema);

module.exports = Unit;
