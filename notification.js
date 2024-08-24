const express = require("express");
const notification = express.Router();

notification.post("/create", (req, res) => {});

notification.post("/delete", (req, res) => {});

module.exports = notification;
