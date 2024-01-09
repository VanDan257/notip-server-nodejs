const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const Chat = require("./Chat");

const Message = sequelize.define(
  "Messages",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Tự động tăng giá trị
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
      trim: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
      trim: true,
    },
    senderId: {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
    },
    chatId: {
      type: DataTypes.UUID,
      references: {
        model: "Chats",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Define associations between Message, User, and Chat models here

// Message.belongsTo(User, { foreignKey: 'chatId', as: 'Sender' });
// User.hasMany(Message, { foreignKey: 'chatId' });
Message.belongsTo(Chat, { foreignKey: "chatId" });

module.exports = Message;
