const express = require("express");
const { Product, ProductModel } = require("../models/product");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const upload = require("../utilities/upload");

router.post("/get-product", (req, res, next) => {
  try {
    ProductModel.findProduct(req, (productArray) => {
      res.json(productArray);
    });
  } catch (error) {
    next(error);
  }
});

router.post("/add-product", upload.array("image", 4), (req, res, next) => {
  if (req.session.user.role !== "admin") {
    next("Only admin can access!");
  } else {
    const errors = [];
    if (
      req.body.name.trim() === "" ||
      req.body.name.length < 1 ||
      req.body.name.length > 20
    ) {
      errors.push({
        param: "name",
        msg: "Name must be between 1 and 20 characters",
      });
    }
    if (
      req.body.category.trim() === "" ||
      req.body.category < 1 ||
      req.body.category > 10
    ) {
      errors.push({
        param: "category",
        msg: "Category must be between 1 and 20 characters",
      });
    }
    if (
      req.body.shortDes.trim() === "" ||
      req.body.shortDes < 10 ||
      req.body.shortDes > 200
    ) {
      errors.push({
        param: "shortDes",
        msg: "Short Description must be between 10 and 200 characters",
      });
    }
    if (
      req.body.longDes.trim() === "" ||
      req.body.longDes < 50 ||
      req.body.longDes > 500
    ) {
      errors.push({
        param: "longDes",
        msg: "Long Description must be between 50 and 500 characters",
      });
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    } else {
      const url = req.protocol + "://" + req.get("host");
      const imageArray = req.files.map((x, i) => {
        return url + /images/ + req.files[i].filename;
      });

      const product = new ProductModel(req);
      product.save(imageArray);
      res.end();
    }
  }
});

router.patch(
  "/edit-product",
  [
    body("name")
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage("Name must be between 1 and 20 characters"),
    body("category")
      .isLength({ min: 1, max: 10 })
      .trim()
      .withMessage("Category must be between 1 and 20 characters"),
    body("shortDes")
      .isLength({ min: 10, max: 500 })
      .trim()
      .withMessage("Short Description must be between 10 and 200 characters"),
    body("longDes")
      .isLength({ min: 50, max: 1000 })
      .trim()
      .withMessage("Long Description must be between 50 and 500 characters"),
  ],
  (req, res, next) => {
    if (req.session.user.role !== "admin") {
      next("Only admin can access!");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      ProductModel.upDate(req.body);
      res.end();
    }
  }
);
router.get("/get-product", (req, res, next) => {
  try {
    ProductModel.read((productArray) => {
      // productArray.forEach((x) => {
      //   const name = x.name.replace(/\s/g, "_");
      //   Product.updateOne(
      //     { name: x.name },
      //     {
      //       img1: `http://localhost:5000/images/img1_${name}.jpg`,
      //       img2: `http://localhost:5000/images/img2_${name}.jpg`,
      //       img3: `http://localhost:5000/images/img3_${name}.jpg`,
      //       img4: `http://localhost:5000/images/img4_${name}.jpg`,
      //     }
      //   )
      //     .then((value) => {
      //       console.log(value);
      //     })
      //     .catch((reason) => {
      //       console.log(reason);
      //     });
      // axios.get(x.img4, { responseType: "stream" }).then((value) => {
      //   const name = x.name.replace(/\s/g, "_");
      //   const ws = fs.createWriteStream(
      //     path.join(__dirname, `../images/img4_${name}.jpg`)
      //   );
      //   value.data.pipe(ws);
      // });
      // });
      res.json(productArray);
    });
  } catch (error) {
    next(error);
  }
});

router.get("/edit-product/:id", (req, res, next) => {
  if (req.session.user.role !== "admin") {
    next("Only admin can access!");
  } else {
    ProductModel.getProductByID(req.params.id, (item) => {
      res.json(item);
    });
  }
});

router.delete("/delete-product/:id", (req, res, next) => {
  if (req.session.user.role !== "admin") {
    next("Only admin can access!");
  } else {
    ProductModel.delete(req.params.id);
    res.end();
  }
});

router.patch("/update-remaining", (req, res, next) => {
  ProductModel.updateRemaining(req);
  res.end();
});
// router.get("/up", (req, res, next) => {
//   ProductModel.up();
//   res.end();
// });

module.exports = router;
