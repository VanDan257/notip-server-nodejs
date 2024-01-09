const sequelize = require("../mySQL/dbconnect");
const { DataTypes } = require("sequelize");

const LoginUserHistory = sequelize.define(
  "LoginUserHistorys",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
    },
    loginTime: {
      type: DataTypes.DATE,
      defaultValue: Date.now,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = LoginUserHistory;
