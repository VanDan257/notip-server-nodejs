const sequelize = require("../mySQL/dbconnect");
const { DataTypes } = require("sequelize");

const TypeChat = sequelize.define("TypeChats", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Tự động tăng giá trị
  },
  typeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = TypeChat;
