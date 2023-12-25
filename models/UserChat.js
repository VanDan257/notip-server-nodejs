const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const User = require("../models/User");
const Chat = require("../models/Chat");

const UserChat = sequelize.define(
  "UserChats",
  {
    userId: {
      type: DataTypes.INTEGER, // Change the data type to match your Message model ID type
      references: {
        model: "Users", // Replace with your Message model name
        key: "id", // Replace with the primary key of Message model
      },
    },
    chatId: {
      type: DataTypes.INTEGER, // Change the data type to match your Message model ID type
      references: {
        model: "Chats", // Replace with your Message model name
        key: "id", // Replace with the primary key of Message model
      },
    },
  },
  {
    timestamps: true,
  }
);

User.belongsToMany(Chat, { through: "UserChats", foreignKey: "userId" });
Chat.belongsToMany(User, { through: "UserChats", foreignKey: "chatId" });

module.exports = UserChat;
