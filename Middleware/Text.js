const dotenv = require("dotenv").config();
const argon2 = require("argon2");
const User = require("../Models/User.js");

const twilio = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.TWILIO_AUTH
);

const sendVerificationText = async function (req, res, next) {
  try {
    const verificationCode = Math.floor(
      Math.random() * (999999 - 100000 + 1) + 100000
    );

    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedVerificationCode = await argon2.hash(`${verificationCode}`);

    user.verificationCode.code = `${hashedVerificationCode}`;
    user.verificationCode.expiry = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    sendText(
      phoneNumber,
      `Your weathalert verification code is: ${verificationCode}`
    );

    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

const sendText = async function (phoneNumber, message) {
  try {
    await twilio.messages.create({
      body: `${message}`,
      to: `+1${phoneNumber}`,
      from: `+1${process.env.TWILIO_PHONE_NUMBER}`,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendVerificationText, sendText };
