const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");

const Chat = sequelize.define(
  "Chats",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    photo: {
      type: DataTypes.STRING,
      defaultValue: "https://cdn-icons-png.flaticon.com/512/9790/9790561.png",
    },
    chatName: {
      type: DataTypes.STRING,
    },
    lastestMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    typeChatId: {
      type: DataTypes.INTEGER,
      references: {
        model: "TypeChats",
        key: "id",
      },
    },
    numberOfMessage: {
      type: DataTypes.INTEGER,
    },
    numberOfMember: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
  }
);

// Define relationships between Chat, User, and Message models here if needed

module.exports = Chat;
