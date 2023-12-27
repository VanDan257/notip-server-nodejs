const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const User = require("./User");
const Role = require("./Role");

const UserRole = sequelize.define(
  "UserRoles",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "User", // Tên của bảng User
        key: "id", // Tên của khóa chính trong bảng User
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Role", // Tên của bảng Role
        key: "id", // Tên của khóa chính trong bảng Role
      },
    },
  },
  {
    timestamps: false,
  }
);

// Tạo quan hệ giữa UserRole và User, Role
UserRole.belongsTo(User, { foreignKey: "userId" });
UserRole.belongsTo(Role, { foreignKey: "roleId" });

module.exports = UserRole;
