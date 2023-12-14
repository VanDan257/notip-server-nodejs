const { DataTypes } = require('sequelize');
const sequelize = require('../mySQL/dbconnect')
const User = require('../models/User')
const Chat = require('../models/Chat')

const UserChat = sequelize.define('UserChats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Tự động tăng giá trị
    },
    userId: {
        type: DataTypes.INTEGER, // Change the data type to match your Message model ID type
        references: {
            model: 'Users', // Replace with your Message model name
            key: 'id', // Replace with the primary key of Message model
        },
    },
    chatId: {
        type: DataTypes.INTEGER, // Change the data type to match your Message model ID type
        references: {
            model: 'Chats', // Replace with your Message model name
            key: 'id', // Replace with the primary key of Message model
        },
    }
}, {
    timestamps: true,
});

User.belongsToMany(Chat, { through: 'UserChats', foreignKey: 'userId' });
Chat.belongsToMany(User, { through: 'UserChats', foreignKey: 'chatId' });

// (async () => {
//     await sequelize.sync(); // This will create the table if it doesn't exist
//     console.log('UserChat table synced');
// })();

module.exports = UserChat;