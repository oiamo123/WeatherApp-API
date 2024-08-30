const express = require("express");
// const notification = require("./notification.js");
const User = require("./Models/User.js");
const { sendVerificationText } = require("./Middleware/Text.js");
const { verifyAccount, verifyToken } = require("./Middleware/Verify.js");
const jwt = require("jsonwebtoken");
const argon = require("argon2");

const account = express.Router();
// account.use("/notification", notification);

account.post("/register", sendVerificationText, async (req, res) => {
  try {
    const { phoneNumber, name, timezone } = req.body;
    const user = await new User(phoneNumber, name, timezone);
    await user.save();

    res
      .status(200)
      .json({ message: `A verification code has been sent to ${phoneNumber}` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "There was an issue. Please try again later" });
  }
});

account.post("/verify", verifyAccount, async (req, res) => {
  try {
    const accessToken = await jwt.sign(
      { exp: Math.floor(Date.now() / 1000) + 15 * 60 },
      process.env.SECRET_JWT_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = await jwt.sign(
      { phoneNumber: req.cookies.phoneNumber },
      process.env.SECRET_JWT_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    res
      .status(200)
      .json({ message: `${req.cookies.phoneNumber} successfully verified` });

    const user = await User.findOne({ phoneNumber: req.cookies.phoneNumber });
    user.refreshToken = await argon.hash(refreshToken);

    await user.save();
  } catch (err) {
    res
      .status(500)
      .json({ message: "There was an issue. Please try again later" });
  }
});

account.post("/update", (req, res) => {});

account.get("/delete", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ phoneNumber: req.cookies.phoneNumber });

    if (!user) {
      throw new Error("User not found");
    }

    await user.remove();

    res.status(200).json({ message: "User successfully removed." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
});

account.post("/login", sendVerificationText, (req, res) => {
  res.cookie("phoneNumber", req.body.phoneNumber, {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({
    message: `Verification code successfully sent to ${req.body.phoneNumber}`,
  });
});

// account.post("/logout", verifyToken, (req, res) => {});

account.get("/theme", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ phoneNumber: req.cookies.phoneNumber });

    res.status(200).json({ theme: user.theme });
  } catch (err) {
    res.status(500).json({ error: true });
  }
});

module.exports = account;
