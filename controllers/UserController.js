const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const Friend = require("../models/Friend");
const UserRole = require("../models/UserRole.js");
const LoginUserHistory = require("../models/LoginUserHistory.js");

class UserController {
  async register(req, res) {
    const { username, phone, email, password } = req.body;
    console.log(req.body);
    try {
      const existingUser = await User.findOne({ where: { email: email } });

      if (existingUser)
        return res.status(400).json({ message: "Email đã tồn tại" });
      const newuser = new User({
        email: email,
        password: password,
        name: username,
        phone: phone,
      });
      const token = await newuser.generateAuthToken();
      await newuser.save();
      await UserRole.create({
        userId: newuser.id,
        roleId: 1,
      });
      res.json({ message: "success", token: token });
    } catch (error) {
      res.status(500).send(error);
    }
  }
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const valid = await User.findOne({ where: { email: email } });

      if (!valid) res.status(200).json({ message: "User don't exist" });
      const validPassword = await bcrypt.compare(password, valid.password);

      if (!validPassword) {
        res.status(200).json({ message: "Invalid Password" });
      } else {
        await LoginUserHistory.create({ userId: valid.id });
        const token = await valid.generateAuthToken();
        await valid.save();
        res.cookie("userToken", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
          data: {
            id: valid.id,
            name: valid.name,
            token: token,
            photoUrl: valid.avatar,
          },
          status: 200,
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
  async validUser(req, res) {
    try {
      const validuser = await User.findOne({
        where: { id: verifiedUser.id },
        attributes: { exclude: ["password"] },
      });
      if (!validuser) res.json({ message: "user is not valid" });
      res.status(201).json({
        user: validuser,
        token: req.token,
      });
    } catch (error) {
      res.status(500).json({ error: error });
      console.log(error);
    }
  }

  async logout(req, res) {
    req.rootUser.tokens = req.rootUser.tokens.filter(
      (e) => e.token != req.token
    );

    res.status(200).json({ message: "Đăng xuất thành công!" });
  }

  async searchUsers(req, res) {
    const { keySearch } = req.params;
    try {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${keySearch}%` } },
            { email: { [Op.like]: `%${keySearch}%` } },
            { phone: { [Op.like]: `%${keySearch}%` } },
          ],
          [Op.and]: [{ id: { [Op.not]: req.rootUserId } }],
        },
      });
      res.status(200).send(users);
    } catch (err) {
      res.status(500).send({ message: "Đã có lỗi xảy ra!" });
    }
  }

  async getUserById(req, res) {
    try {
      const selectedUser = await User.findOne({
        where: { id: req.rootUserId },
        attributes: { exclude: ["password"] },
      });

      res.status(200).json(selectedUser);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
  async updateInfo(req, res) {
    const userProfile = req.body;
    const updatedUser = await User.update(
      {
        name: userProfile.name,
        gender: userProfile.gender,
        dob: userProfile.dob,
        phone: userProfile.phone,
        email: userProfile.email,
        address: userProfile.address,
      },
      {
        where: {
          id: req.rootUserId, // Cập nhật người dùng có ID tương ứng
        },
      },
      { individualHooks: true }
    );

    res.status(200).json(await User.findByPk(req.rootUserId));
  }
  async updateAvatar(req, res) {
    try {
      let file;
      let uploadPath;
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      // The name of the input field (i.e. "file") is used to retrieve the uploaded file
      file = req.files.file;

      uploadPath =
        "E:\\Do_An_5\\notip-client\\src\\assets\\images\\avatar-user\\" +
        file.name;

      // Use the mv() method to place the file somewhere on your server
      file.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });

      let user = await User.update(
        { avatar: "avatar-user/" + file.name },
        { where: { id: req.rootUserId } }
      );

      console.log("user: ", user);

      res.status(200).json(await User.findByPk(req.rootUserId));
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async loginAdmin(req, res) {
    const { email, password } = req.body;
    try {
      const valid = await User.findOne({ where: { email: email } });
      if (!valid) res.status(200).json({ message: "User don't exist" });
      const validPassword = await bcrypt.compare(password, valid.password);

      if (!validPassword) {
        res.status(200).json({ message: "Invalid Password" });
      } else {
        const userRole = await UserRole.findOne({
          where: { userId: valid.id },
        });
        if (userRole.roleId === 2 || userRole.roleId === 3) {
          const token = await valid.generateAuthToken();
          await valid.save();
          res.cookie("userToken", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          });
          res.status(200).json({
            data: {
              id: valid.id,
              name: valid.name,
              token: token,
              photoUrl: valid.avatar,
            },
          });
        } else {
          res.status(401).json({
            message: "Bạn không có quyền truy cập vào trang quản trị",
          });
        }
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async createAccountAdmin(req, res) {
    const { username, phone, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email: email } });

      if (existingUser)
        return res.status(400).json({ message: "Email đã tồn tại" });
      const newuser = new User({
        email: email,
        password: password,
        name: username,
        phone: phone,
      });
      await newuser.save();
      await UserRole.create({
        userId: newuser.id,
        roleId: 2,
      });
      res.json({ message: "success" });
    } catch (error) {
      res.status(500).send(error);
    }
  }

  // async changeRoleAdmin(req, res) {

  // }
}

module.exports = UserController;
