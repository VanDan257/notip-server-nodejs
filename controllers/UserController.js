const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const Friend = require("../models/Friend");
const UserRole = require("../models/UserRole.js");
const LoginUserHistory = require("../models/LoginUserHistory.js");
const sequelize = require("../mySQL/dbconnect.js");
const uploadToCloudinary = require("../utils/cloudinary.js");
const { response } = require("express");

class UserController {
  async register(req, res) {
    const { username, phone, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email: email } });

      if (existingUser)
        return res.status(400).json({ message: "Email đã tồn tại" });

      const newuser = await User.create({
        email: email,
        password: password,
        name: username,
        phone: phone,
        status: 1,
      });
      const token = await newuser.generateAuthToken();
      await UserRole.create({
        userId: newuser.id,
        roleId: 1,
      });
      res.json({ message: "success", token: token });
    } catch (error) {
      res.status(500).json(error);
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
      res.status(500).json(error);
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
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      // The name of the input field (i.e. "file") is used to retrieve the uploaded file
      file = req.files.file;

      const result = await uploadToCloudinary(file.data, {
        folder: "avatar-user//",
      });

      await User.update(
        { avatar: "avatar-user/" + file.name },
        { where: { id: req.rootUserId } }
      );

      // console.log("user: ", user);

      res.status(200).json(await User.findByPk(req.rootUserId));
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async deleteUser(req, res) {
    const { userId } = req.body;
    console.log(req.body);
    if ((await User.destroy(userId)) > 0) {
      res.status(200);
    } else {
      res.status(500).json({ message: "Đã có lỗi xảy ra!" });
    }
  }

  // api admin
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
    const { name, gender, email, phone, address, password, dob, role } =
      req.body;
    try {
      const existingUser = await User.findOne({ where: { email: email } });
      if (existingUser)
        return res.status(400).json({ message: "Email đã tồn tại" });
      const newUser = new User({
        email: email,
        password: password,
        name: name,
        address: address,
        gender: gender,
        dob: dob,
        phone: phone,
        status: 1,
      });

      let file;
      if (req.files) {
        // The name of the input field (i.e. "file") is used to retrieve the uploaded file
        file = req.files.file;
        let fileName = file.name.split(".");

        const result = await uploadToCloudinary(file.data, {
          resource_type: "auto",
          folder: "admin-avatar/",
          public_id: fileName[0],
        });

        newUser.avatar = "admin-avatar/" + file.name;
      }

      await newUser.save();
      await UserRole.create({
        userId: newUser.id,
        roleId: role,
      });
      res.json(newUser);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAllClient(req, res) {
    try {
      const clients = await sequelize.query(
        "SELECT * FROM `users` order by id desc",
        { type: sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAllAdmins(req, res) {
    try {
      const admins = await sequelize.query(
        "SELECT * FROM `users` as u INNER JOIN userroles as ur ON u.id = ur.userId WHERE ur.roleId = 2",
        { type: sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(admins);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getInfoAdmin(req, res) {
    const { adminId } = req.params;
    try {
      const admin = await User.findByPk(adminId);
      return response.status(200).json(admin);
    } catch (err) {
      return res.status(500).json({ message: "Đã có lỗi xảy ra!" });
    }
  }
}

module.exports = UserController;
