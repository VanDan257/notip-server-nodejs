const sequelize = require('../mySQL/dbconnect')
const { DataTypes } = require('sequelize');

const TypeChat = sequelize.define('TypeChats', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Tự động tăng giá trị
    },
    typeName: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

// (async () => {
//     await sequelize.sync(); // This will create the table if it doesn't exist
//     console.log('TypeChat table synced');
// })();

module.exports = TypeChat;