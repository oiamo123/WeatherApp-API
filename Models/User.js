const mongoose = require("mongoose");
const moment = require("moment");

// prettier-ignore
const User = mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"]
    },
    name: { type: String, default: "" },
    notificationDays: {
      type: [{ date: Date, location: { city: String, country: String } }],
      default: []
    },
    timezoneOffset: { type: Number, required: true },
    notificationTime: { type: Number, default: 9 },
    weatherConditions: { type: [String], default: [] },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    verificationCode: {
      code: { type: String, default: "" },
      expiry: { type: Date, default: () => Date.now() + 7*24*60*60*1000 }
    },
    verified: { type: Boolean, default: false }
  },
  { collection: "Users" }
);

module.exports = mongoose.model("User", User);
