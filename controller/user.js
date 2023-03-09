const express = require("express");
const UserModel = require("../models/user");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const session = require("express-session");

SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  "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";

router.post(
  "/signup",
  [
    body("name").isLength({ min: 3 }).withMessage("Please input name"),
    body("email").isEmail().trim().withMessage("Incorrect email format"),
    body("password")
      .isStrongPassword()
      .trim()
      .withMessage(
        "Password must have at least 8 characters, have uppercase characters, have lowercase characters, have Symbol, must contain numbers."
      ),
    body("tel").isMobilePhone().withMessage("please input phone number"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const user = new UserModel(req);
      user.addUser();
      res.end();
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().trim().withMessage("Incorrect email format"),
    body("password")
      .isStrongPassword()
      .trim()
      .withMessage(
        "Password must have at least 8 characters, have uppercase characters, have lowercase characters, have Symbol, must contain numbers."
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      UserModel.getOneUser(req, (user) => {
        if (user) {
          req.session.user = user;
          const whitelist = ["http://localhost:3000", "http://localhost:3001"];
          const origin = req.headers.origin;
          if (whitelist.indexOf(origin) > -1) {
            res.setHeader("Access-Control-Allow-Origin", origin);
          }
          res.setHeader("Access-Control-Allow-Credentials", true);
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
          );
          res.json({ role: req.session.user.role });
        } else {
          res
            .status(400)
            .json({ errors: [{ param: "user", msg: "User not found" }] });
        }
      });
    }
  }
);

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.end();
});

router.get("/get-user", (req, res, next) => {
  if (req.session.user) {
    res.json({
      name: req.session.user.name,
      email: req.session.user.email,
      tel: req.session.user.tel,
    });
  } else {
    res.end();
  }
});

module.exports = router;
