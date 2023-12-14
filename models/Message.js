const { DataTypes } = require('sequelize');
const sequelize = require('../mySQL/dbconnect')
const User = require('./User')
const Chat = require('./Chat')

const Message = sequelize.define('Messages', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Tự động tăng giá trị
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
    },
    senderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    chatId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Chats',
            key: 'id'
        }
    }
}, {
    timestamps: true,
});

// Define associations between Message, User, and Chat models here
Message.belongsTo(User, { foreignKey: 'senderId' }); // Replace 'User' with your User model name and 'senderId' with the appropriate foreign key
Message.belongsTo(Chat, { foreignKey: 'chatId' }); // Replace 'Chat' with your Chat model name and 'chatId' with the appropriate foreign key

// (async () => {
//     await sequelize.sync(); // This will create the table if it doesn't exist
//     console.log('Message table synced');
// })();

module.exports = Message;
