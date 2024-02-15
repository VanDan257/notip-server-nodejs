const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const User = require("./User");

const FriendStatus = sequelize.define(
  "FriendStatuses",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Tự động tăng giá trị
    },
    statusName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = FriendStatus;
