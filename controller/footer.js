const express = require("express");
const getFooter = require("../models/footer");
const router = express.Router();

router.get("/", (req, res, next) => {
  getFooter((footerData) => {
    res.json(footerData);
  });
});

module.exports = router;
