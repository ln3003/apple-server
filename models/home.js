const mongoose = require("../utilities/database");
const { Schema } = mongoose;

const homeSchema = new Schema({
  bannerImage: String,
  bannerText1: String,
  bannerText2: String,
  cateText1: String,
  cateText2: String,
  cateImage1: String,
  cateImage2: String,
  cateImage3: String,
  cateImage4: String,
  cateImage5: String,
  infoLabel1: String,
  infoText1: String,
  infoLabel2: String,
  infoText2: String,
  infoLabel3: String,
  infoText3: String,
  infoLabel4: String,
  infoText4: String,
});

const Home = mongoose.model("Home", homeSchema);

const getHome = (getDataHome) => {
  Home.find()
    .then((value) => {
      getDataHome(value);
    })
    .catch((reason) => {
      console.log(reason);
    });
};

module.exports = getHome;
