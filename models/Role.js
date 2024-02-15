const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");

const Role = sequelize.define(
  "Roles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Tự động tăng giá trị
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomalizedName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);
module.exports = Role;
