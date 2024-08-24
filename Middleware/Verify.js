const User = require("../Models/User.js");
const argon = require("argon2");

const verifyAccount = async function (phoneNumber, sampleVerificationCode) {
  try {
    const user = await User.findOne({
      phoneNumber: phoneNumber,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.verificationCode.expiry < Date.now()) {
      throw new Error("Code is expired");
    }

    const isCodeValid = await argon.verify(
      user.verificationCode.code,
      `${sampleVerificationCode}`
    );

    if (isCodeValid) {
      console.log("Verification successful");
      user.verified = true;
      user.verificationCode.code = "";

      await user.save();
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = verifyAccount;
