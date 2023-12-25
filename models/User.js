const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("../mySQL/dbconnect");
const { DataTypes } = require("sequelize");
const Friend = require("./Friend");
const Message = require("./Message");

const User = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Tự động tăng giá trị
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    currentSession: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

User.beforeCreate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.prototype.generateAuthToken = async function () {
  try {
    let token = jwt.sign(
      { id: this.id, email: this.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    return token;
  } catch (error) {
    console.log("error while generating token");
  }
};

// User.hasMany(Message, { foreignKey: 'senderId' });

module.exports = User;
