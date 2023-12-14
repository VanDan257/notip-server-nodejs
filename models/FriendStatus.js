const { DataTypes } = require('sequelize');
const sequelize = require('../mySQL/dbconnect')
const User = require('./User')

const FriendStatus = sequelize.define('FriendStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Tự động tăng giá trị
    },
    statusName: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: true,
});

// (async () => {
//     await sequelize.sync(); // This will create the table if it doesn't exist
//     console.log('FriendStatus table synced');
// })();

module.exports = FriendStatus;