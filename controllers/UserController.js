const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const { Sequelize } = require("sequelize");
const Op = require("sequelize").Op;

class UserController {
  async register(req, res) {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
      const existingUser = await User.findOne({ where: { email: email } });

      if (existingUser)
        return res.status(200).json({ error: "User already Exits" });
      const newuser = new User({ email, password, name: username });
      const token = await newuser.generateAuthToken();
      await newuser.save();
      res.json({ message: "success", token: token });
    } catch (error) {
      console.log("Error in register " + error);
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
        const token = await valid.generateAuthToken();
        await valid.save();
        res.cookie("userToken", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
          name: valid.name,
          token: token,
          photoUrl: valid.avatar,
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
  }

  async searchUsers(req, res) {
    // const excludedUserId = req.rootUserId; // Lấy ID của người dùng hiện tại

    const search = req.query.search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${req.query.search}%` } },
            { email: { [Op.like]: `%${req.query.search}%` } },
          ],
        }
      : {};

    const users = await User.findAll({
      where: {
        [Op.and]: [
          search,
          // { id: { [Op.ne]: req.rootUserId } },
        ],
      },
    });
    res.status(200).send(users);
  }
  async getUserById(req, res) {
    const { id } = req.params;
    try {
      // const selectedUser = await user.findOne({ _id: id }).select('-password');
      const selectedUser = await User.findOne({
        where: { id: id },
        attributes: { exclude: ["password"] },
      });

      res.status(200).json(selectedUser);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
  async updateInfo(req, res) {
    const { id } = req.params;
    const { bio, name } = req.body;
    const updatedUser = await User.update(
      {
        name,
        bio,
      },
      {
        where: {
          id: id, // Cập nhật người dùng có ID tương ứng
        },
      }
    );
    res.status(200);
  }
  async updateProfilePic(req, res) {
    try {
      // upload file
      let file;
      let uploadPath;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }
      file = req.files.file;
      uploadPath = "E:\\Do_An_5\\notip-client\\src\\assets\\images\\avatar-user" + file.name;
      file.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);

        res.status(500).send("Failed to save image!");
      });

      // update user
      const { profilePic } = req.body;
      const updatedUser = await User.update(
        {
          profilePic: profilePic,
        },
        {
          where: {
            id: 1, //req.rootUserId
          },
        }
      );
      res.status(200);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async putHubConnection(req, res) {
    try{
      const { key } = req.body;
      const userSession = req.rootUserId;
      const user = await User.findByPk(userSession)

      if(user != null){
        user.currentSession = key;
        await User.update(
            {
              currentSession: key
            },
            {
              where: {id: userSession}
            }
        );
        res.status(200);
      }
      else{
        res.status(200).send("Not found current user!");
      }
    }
    catch (e){
      res.status(500).json(e);
    }
  }
}

module.exports = UserController;

// export const googleAuth = async (req, res) => {
//     try {
//         const { tokenId } = req.body;
//         const client = new OAuth2Client(process.env.CLIENT_ID);
//         const verify = await client.verifyIdToken({
//             idToken: tokenId,
//             audience: process.env.CLIENT_ID,
//         });
//         const { email_verified, email, name, picture } = verify.payload;
//         if (!email_verified) res.json({ message: 'Email Not Verified' });
//         const userExist = await user.findOne({ email }).select('-password');
//         if (userExist) {
//             res.cookie('userToken', tokenId, {
//                 httpOnly: true,
//                 maxAge: 24 * 60 * 60 * 1000,
//             });
//             res.status(200).json({ token: tokenId, user: userExist });
//         } else {
//             const password = email + process.env.CLIENT_ID;
//             const newUser = await user({
//                 name: name,
//                 profilePic: picture,
//                 password,
//                 email,
//             });
//             await newUser.save();
//             res.cookie('userToken', tokenId, {
//                 httpOnly: true,
//                 maxAge: 24 * 60 * 60 * 1000,
//             });
//             res
//                 .status(200)
//                 .json({ message: 'User registered Successfully', token: tokenId });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error });
//         console.log('error in googleAuth backend' + error);
//     }
// };
