const { Sequelize } = require("sequelize");

// Khởi tạo một đối tượng Sequelize và cung cấp thông tin kết nối đến cơ sở dữ liệu MySQL
const sequelize = new Sequelize(
  process.env.DB_DATABASENAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST, // Thay đổi thành địa chỉ host của cơ sở dữ liệu MySQL của bạn nếu cần thiết
    dialect: "mysql", // Loại cơ sở dữ liệu sử dụng là MySQL,
    logging: false,
  }
);

// Kiểm tra kết nối bằng cách sử dụng phương thức authenticate của Sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối thành công đến cơ sở dữ liệu MySQL.");
  })
  .catch((err) => {
    console.error("Không thể kết nối đến cơ sở dữ liệu:", err);
  });

(async () => {
  await sequelize.sync(); // This will create the table if it doesn't exist
  console.log("database notip synced");
})();

module.exports = sequelize;
