const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary với cloud_name, api_key, và api_secret của bạn
cloudinary.config({
  cloud_name: "drvjtqywh",
  api_key: "741882459997557",
  api_secret: "KGTxwaRopyjawAZxr-Z5jrI0UxU",
  secure: true,
});

module.exports = cloudinary;
