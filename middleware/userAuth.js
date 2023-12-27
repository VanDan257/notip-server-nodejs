const jwt = require("jsonwebtoken");
const User = require("../models/User");
const moment = require("moment");
const Role = require("../models/Role");
const UserRole = require("../models/UserRole");

const Auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1]; //when using browser this line
    const verifiedUser = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      where: { id: verifiedUser.id },
      attributes: { exclude: ["password"] },
    });

    if (rootUser) {
      await User.update(
        { lastLogin: moment().format("YYYY-MM-DD HH:mm:ss") },
        { where: { id: rootUser.id } }
      );

      req.token = token;
      req.rootUser = rootUser;
      req.rootUserId = rootUser.id;
      next();
    } else {
      res.json({ message: "Lỗi đăng nhập! Hãy đăng nhập lại" });
    }
  } catch (error) {
    // console.log(error);
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};

const checkUserRole = async (req, res, next) => {
  const role = await UserRole.findOne({
    where: { userId: req.rootUserId },
  });

  if (role.roleId === 1 || role.roleId === 2 || role.roleId === 3) {
    next();
  } else {
    res.status(500).json({ message: "Bạn không có quyền truy cập trang này" });
  }
};

const checkAdminRole = async (req, res, next) => {
  const role = await UserRole.findOne({
    where: { userId: req.rootUserId },
  });

  if (role.roleId === 2 || role.roleId === 3) {
    next();
  } else {
    res.status(500).json({ message: "Bạn không có quyền truy cập trang này" });
  }
};

const checkModeratorRole = async (req, res, next) => {
  const role = await UserRole.findOne({
    where: { userId: req.rootUserId },
  });

  if (role.roleId === 3) {
    next();
  } else {
    res.status(500).json({ message: "Bạn không có quyền truy cập trang này" });
  }
};

module.exports = { Auth, checkUserRole, checkAdminRole, checkModeratorRole };
