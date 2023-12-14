const { DataTypes } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");

const Chat = sequelize.define(
  "Chats",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Tự động tăng giá trị
    },
    photo: {
      type: DataTypes.STRING,
      defaultValue: "https://cdn-icons-png.flaticon.com/512/9790/9790561.png",
    },
    chatName: {
      type: DataTypes.STRING,
    },
    lastestMessage:{
      type: DataTypes.STRING,
      allowNull: true
    },
    typeChatId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'TypeChats',
          key: 'id'
        }
    },
  },
  {
    timestamps: true,
  }
);

// Define relationships between Chat, User, and Message models here if needed

// (async () => {
//     await sequelize.sync(); // This will create the table if it doesn't exist
//     console.log('Chat table synced');
// })();

module.exports = Chat;
