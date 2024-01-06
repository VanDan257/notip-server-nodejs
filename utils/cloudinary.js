const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Cấu hình Cloudinary với cloud_name, api_key, và api_secret của bạn
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Hàm để upload dữ liệu lên Cloudinary sử dụng Promise và async/await
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Gửi dữ liệu từ buffer vào writable stream để upload lên Cloudinary
    uploadStream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
