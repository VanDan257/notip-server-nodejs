const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("../mySQL/dbconnect");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    lastActive: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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

// CREATE TRIGGER `generate_id_users_create` BEFORE INSERT ON `users`
//  FOR EACH ROW BEGIN
//     SET NEW.id = UNHEX(REPLACE(UUID(), '-', ''));
// END
