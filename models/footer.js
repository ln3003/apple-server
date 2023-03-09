const mongoose = require("../utilities/database");
const { Schema } = mongoose;

const footerSchema = new Schema({
  title: String,
  links: [String],
});

const Footer = mongoose.model("Footer", footerSchema);

const getFooter = (getDataFooter) => {
  Footer.find()
    .then((value) => {
      getDataFooter(value);
    })
    .catch((reason) => {
      console.log(reason);
    });
};

module.exports = getFooter;
