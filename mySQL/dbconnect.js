const { Sequelize } = require('sequelize');

// Khởi tạo một đối tượng Sequelize và cung cấp thông tin kết nối đến cơ sở dữ liệu MySQL
const sequelize = new Sequelize(process.env.DB_DATABASENAME, process.env.DB_USERNAME, '', {
    host: 'localhost', // Thay đổi thành địa chỉ host của cơ sở dữ liệu MySQL của bạn nếu cần thiết
    dialect: 'mysql', // Loại cơ sở dữ liệu sử dụng là MySQL
});

// Kiểm tra kết nối bằng cách sử dụng phương thức authenticate của Sequelize
sequelize
    .authenticate()
    .then(() => {
        console.log('Kết nối thành công đến cơ sở dữ liệu MySQL.');
    })
    .catch((err) => {
        console.error('Không thể kết nối đến cơ sở dữ liệu:', err);
    });

module.exports = sequelize;
