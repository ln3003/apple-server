const mongoose = require("../utilities/database");
const { Schema } = mongoose;

const productSchema = new Schema({
  category: String,
  img1: String,
  img2: String,
  img3: String,
  img4: String,
  long_desc: String,
  name: String,
  price: String,
  remaining: Number,
  short_desc: String,
});
const Product = mongoose.model("Product", productSchema);

module.exports = Product;

class ProductModel {
  constructor(req) {
    this.category = req.body.category;
    this.img1 = "";
    this.img2 = "";
    this.img3 = "";
    this.img4 = "";
    this.long_desc = req.body.longDes;
    this.name = req.body.name;
    this.price = 6500000;
    this.remaining = 10;
    this.short_desc = req.body.shortDes;
  }
  save(imageArray) {
    const query = async () => {
      try {
        this.img1 = imageArray[0];
        this.img2 = imageArray[1];
        this.img3 = imageArray[2];
        this.img4 = imageArray[3];
        await Product.create(this);
      } catch (error) {
        console.log(error);
      }
    };
    query();
  }
  static read(getProduct) {
    const query = async () => {
      try {
        const allProduct = await Product.find();
        if (getProduct) {
          getProduct(allProduct);
        }
      } catch (error) {
        console.log(error);
      }
    };
    query();
  }

  static findProduct(req, getProduct) {
    const query = async () => {
      try {
        const allProduct = await Product.find({
          name: { $regex: `(?i)${req.body.value}(?-i)` },
        });
        if (getProduct) {
          getProduct(allProduct);
        }
      } catch (error) {
        console.log(error);
      }
    };
    query();
  }
  static delete(id) {
    const query = async () => {
      try {
        const result = await Product.deleteOne({
          _id: mongoose.Types.ObjectId(id),
        });
      } catch (error) {
        console.log(error);
      }
    };
    query();
  }
  static getProductByID(id, getItem) {
    const query = async () => {
      try {
        const item = await Product.findOne({
          _id: mongoose.Types.ObjectId(id),
        });
        getItem(item);
      } catch (error) {
        console.log(error);
      }
    };
    query();
  }
  static upDate(item) {
    const query = async () => {
      try {
        const result = await Product.updateOne(
          { _id: mongoose.Types.ObjectId(item.id) },
          {
            name: item.name,
            category: item.category,
            short_desc: item.shortDes,
            long_desc: item.longDes,
          }
        );
      } catch (error) {
        console.log(error);
      }
    };
    query();
  }
  static updateRemaining(req) {
    (async () => {
      const product = await Product.findOne(
        { _id: mongoose.Types.ObjectId(req.body.id) },
        "remaining"
      );
      const newRemaining = product.remaining - req.body.quantity;
      newRemaining > -1 &&
        (await Product.updateOne(
          { _id: mongoose.Types.ObjectId(req.body.id) },
          { remaining: newRemaining }
        ));
    })();
  }
  // static up() {
  //   Product.find()
  //     .then((value) => {
  //       value.forEach((x) => {
  //         const image1 = x.img1.replace(
  //           "https://apple-shop-hfwh.onrender.com",
  //           "https://appleserver.ngh.one"
  //         );
  //         const image2 = x.img2.replace(
  //           "https://apple-shop-hfwh.onrender.com",
  //           "https://appleserver.ngh.one"
  //         );
  //         const image3 = x.img3.replace(
  //           "https://apple-shop-hfwh.onrender.com",
  //           "https://appleserver.ngh.one"
  //         );
  //         const image4 = x.img4.replace(
  //           "https://apple-shop-hfwh.onrender.com",
  //           "https://appleserver.ngh.one"
  //         );
  //         Product.updateOne(
  //           { _id: x._id },
  //           { img1: image1, img2: image2, img3: image3, img4: image4 }
  //         ).then();
  //       });
  //     })
  //     .catch((reason) => {
  //       console.log(reason);
  //     });
  // }
}

module.exports = { Product, ProductModel };
