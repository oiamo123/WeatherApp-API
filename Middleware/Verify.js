const User = require("../Models/User.js");
const argon = require("argon2");
const jwt = require("jsonwebtoken");

const verifyAccount = async function (req, res, next) {
  try {
    const user = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.verificationCode.expiry < req.body.timestamp) {
      throw new Error("Code is expired");
    }

    const isCodeValid = await argon.verify(
      user.verificationCode.code,
      `${req.body.verificationCode}`
    );

    if (isCodeValid) {
      user.verified = true;
      user.verificationCode.code = "";

      await user.save();
      next();
    } else {
      res.status(400).json({
        message: `The verification code for ${req.body.phoneNumber} is invalid. Please try again.`,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const verifyRefreshToken = async function (req, res, next, user) {
  try {
    const decodedRefreshToken = await jwt.verify(
      req.cookies.refreshToken,
      process.env.SECRET_JWT_KEY
    );

    if (!user || user.phoneNumber !== decodedRefreshToken.phoneNumber) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const refreshTokenValid = await argon.verify(
      user.refreshToken,
      req.cookies.refreshToken
    );

    if (refreshTokenValid) {
      return signTokens(req, body, next, user);
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const signTokens = async function (req, body, next, user) {
  try {
    const accessToken = await jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 15 * 60,
      },
      process.env.SECRET_JWT_KEY,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = await jwt.sign(
      { phoneNumber: phoneNumber },
      process.env.SECRET_JWT_KEY,
      {
        expiresIn: "7d",
      }
    );

    user.refreshToken = await argon2d.hash(refreshToken);
    await user.save();

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const verifyToken = async function (req, res, next) {
  try {
    const data = await jwt.verify(
      req.cookies.accessToken,
      process.env.SECRET_JWT_KEY
    );

    const user = await User.findOne({ phoneNumber: data.phoneNumber });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (Date.now() < data.exp * 1000) {
      req.user = user;
      return next();
    }

    verifyRefreshToken(req, res, next, user);
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { verifyAccount, verifyToken };
