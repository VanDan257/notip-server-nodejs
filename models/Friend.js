const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const User = require("./User");
const FriendStatus = require("./FriendStatus");
const Chat = require("./Chat");

const Friend = sequelize.define(
  "Friends",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Tự động tăng giá trị
    },
    senderId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    recipientId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    friendStatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: "FriendStatuses",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Friend.belongsTo(User, { foreignKey: 'senderId', as: 'Senders' }); // Replace 'User' with your User model name and 'senderId' with the appropriate foreign key
// Friend.belongsTo(User, { foreignKey: 'recipientId', as: 'Recipients' }); // Replace 'User' with your User model name and 'senderId' with the appropriate foreign key
Friend.belongsTo(FriendStatus, { foreignKey: "friendStatusId" }); // Replace 'Chat' with your Chat model name and 'chatId' with the appropriate foreign key

module.exports = Friend;
