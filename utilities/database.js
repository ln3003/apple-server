const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect("mongodb+srv://root:okyouwin11@cluster0.skuqtts.mongodb.net/shop?retryWrites=true&w=majority");
  } catch (error) {
    console.log(error);
  }
}

module.exports = mongoose;
