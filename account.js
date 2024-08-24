const express = require("express");
const mongoose = require("mongoose");
const notification = require("./notification.js");

const account = express.Router();
account.use("/notification", notification);

account.post("/register", (req, res) => {});

account.post("/verify", (req, res) => {});

account.post("/update", (req, res) => {});

account.get("/delete", (req, res) => {});

account.post("/login", (req, res) => {});

account.post("/logout", (req, res) => {});

module.exports = account;
