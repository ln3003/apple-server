const express = require("express");
const getHome = require("../models/home");
const router = express.Router();

router.get("/", (req, res, next) => {
  getHome((homeData) => {
    res.json(homeData);
  });
});

module.exports = router;
