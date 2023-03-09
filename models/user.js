const mongoose = require("../utilities/database");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const chatItem = { isAdmin: Boolean, message: String };

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  tel: String,
  chat: [chatItem],
  role: String,
});
const User = mongoose.model("User", userSchema);

class UserModel {
  constructor(req) {
    this.name = req.body.name;
    this.email = req.body.email;
    this.password = req.body.password;
    this.tel = req.body.tel;
    this.role = "customer";
  }
  addUser() {
    const query = async () => {
      this.password = await bcrypt.hash(this.password, 12);
      User.create(this);
    };
    query();
  }
  static getOneUser(req, getDataUser) {
    User.findOne({ email: req.body.email })
      .then((user) => {
        bcrypt.compare(req.body.password, user.password).then(() => {
          getDataUser(user);
        });
      })
      .catch((reason) => {
        getDataUser(null);
      });
  }
  static getChat(email, getDataChat) {
    User.findOne({ email: email }, "chat")
      .then((value) => {
        getDataChat(value);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }
  static addChat(email, message, getDataChat) {
    const query = async () => {
      const { chat } = await User.findOne({ email: email }, "chat");
      chat.unshift(message);
      await User.updateOne({ email: email }, { chat: chat });
      const value = await User.findOne({ email: email }, "chat");
      getDataChat(value);
    };
    query();
  }
  static countClient(getClient) {
    User.find({ role: "customer" })
      .then((value) => {
        getClient(value.length);
      })
      .catch((reason) => {
        console.log(reason);
      });
  }
}

module.exports = UserModel;
