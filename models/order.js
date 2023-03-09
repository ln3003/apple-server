const mongoose = require("../utilities/database");
const UserModel = require("./user");
const { Schema } = mongoose;

const item = {
  item: {
    _id: String,
    category: String,
    img1: String,
    img2: String,
    img3: String,
    img4: String,
    long_desc: String,
    name: String,
    price: String,
    short_desc: String,
  },
  quantity: Number,
};

const orderSchema = new Schema({
  idUser: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  address: String,
  orderItem: [item],
  orderTime: Date,
  delivery: String,
  status: String,
});

const Order = mongoose.model("Order", orderSchema);

class OrderModel {
  constructor(req) {
    this.idUser = req.session.user._id;
    this.address = req.body.address;
    this.orderItem = req.body.cart;
    this.orderTime = new Date().toISOString();
    this.delivery = "Waiting for progressing";
    this.status = "Waiting for pay";
  }
  addOrder() {
    Order.create(this).then().catch();
  }
  static getOrder(req, getDataOrder) {
    Order.find({ idUser: req.session.user._id })
      .populate("idUser", "_id name email tel")
      .then((value) => {
        getDataOrder(value);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }
  static getAllOrders(getDataAllOrder) {
    UserModel.countClient((numberClient) => {
      Order.find()
        .populate("idUser")
        .then((value) => {
          const earningNumber = value.reduce((preSum, x) => {
            return (preSum += x.orderItem.reduce((preSum2, x2) => {
              return (preSum2 += Number(x2.item.price));
            }, 0));
          }, 0);
          getDataAllOrder({
            userNumber: numberClient,
            earningNumber,
            orderNumber: value.length,
            transactions: value,
          });
        })
        .catch((reason) => {
          console.log(reason);
        });
    });
  }
  static getOrderByID(req, getDataOrder) {
    Order.findById({ _id: mongoose.Types.ObjectId(req.body.id) })
      .populate("idUser", "_id name email tel")
      .then((value) => {
        getDataOrder(value);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }
}

module.exports = OrderModel;
