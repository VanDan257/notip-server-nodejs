const jwt = require("jsonwebtoken");
const User = require("../models/User");

const Auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1]; //when using browser this line
    // let token = req.headers.authorization.split(' ')[1]; //when using postman this line
    // if (token.length < 500) {
    const verifiedUser = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      where: { id: verifiedUser.id },
      attributes: { exclude: ["password"] },
    });

    req.token = token;
    req.rootUser = rootUser;
    req.rootUserId = rootUser.id;
    next();
  } catch (error) {
    // console.log(error);
    res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = Auth;
