const User = require("../models/User");
const Chat = require("../models/Chat");
const UserChat = require("../models/UserChat");
const Message = require("../models/Message");
const { Op } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const Friend = require("../models/Friend");

class ChatController {
  async accessChatUser(req, res) {
    const { userId } = req.body;
    try {
      let chatId = await sequelize.query(
        `
          SELECT chatId
          FROM userchats
          WHERE chatId IN (
            SELECT chatId
            FROM userchats
            WHERE userId IN (` +
          userId +
          `, ` +
          req.rootUserId +
          `)
            GROUP BY chatId
            HAVING COUNT(DISTINCT userId) = 2
          )
          GROUP BY chatId
          HAVING COUNT(*) = 2`,
        { type: sequelize.QueryTypes.SELECT }
      );

      let chat = new Chat();
      if (chatId.length > 0) {
        chat = await Chat.findByPk(chatId[0].chatId);
      } else {
        chat = await Chat.create({
          typeChatId: 1,
        });

        await UserChat.create({
          chatId: chat.id,
          userId: req.rootUserId,
        });

        await UserChat.create({
          chatId: chat.id,
          userId: userId,
        });
      }
      res.status(200).json(chat);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async fetchAllChats(req, res) {
    try {
      let chats = await sequelize.query(
        "SELECT `Chats`.*  FROM `Chats` AS `Chats` INNER JOIN ( `UserChats` AS `Users->UserChats` INNER JOIN `Users` AS `Users` ON `Users`.`id` = `Users->UserChats`.`userId`) ON `Chats`.`id` = `Users->UserChats`.`chatId` AND `Users`.`id` = " +
          req.rootUserId +
          " ORDER BY `Chats`.`updatedAt` DESC;",
        { type: sequelize.QueryTypes.SELECT }
      );

      const lstChat = chats;

      for (let i = 0; i < lstChat.length; i++) {
        if (lstChat[i].typeChatId == 1) {
          var userChat = await UserChat.findOne({
            where: {
              chatId: lstChat[i].id,
              userId: {
                [Op.ne]: 1, // req.rootUserId, // Sử dụng Op.ne để loại trừ userId = 1
              },
            },
          });

          if (userChat == null) {
            res.status(200).send("Not found user chat!");
          }

          var user = await User.findByPk(userChat.userId);
          lstChat[i].chatName = user.name;
          lstChat[i].photo = user.avatar;
        }
      }

      lstChat.sort((chat) => {
        chat.updatedAt;
      });
      res.status(200).json(lstChat);
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }

  async searchAllGroup(req, res) {
    const { keySearch } = req.params;
    try {
      // search all chat groups
      let chats = await sequelize.query(
        "SELECT `Chats`.*  FROM `Chats` AS `Chats` INNER JOIN ( `UserChats` AS `Users->UserChats` INNER JOIN `Users` AS `Users` ON `Users`.`id` = `Users->UserChats`.`userId`) ON `Chats`.`id` = `Users->UserChats`.`chatId` AND `Users`.`id` = " +
          req.rootUserId +
          " WHERE Chats.chatName LIKE '%" +
          keySearch +
          "%'" +
          " ORDER BY `Chats`.`updatedAt` DESC;",
        { type: sequelize.QueryTypes.SELECT }
      );

      const lstChat = chats;

      // Nếu roomChat là chat riêng tư (1-1) thì lấy tên và ảnh đối phương
      for (let i = 0; i < lstChat.length; i++) {
        if (lstChat[i].typeChatId == 1) {
          var userChat = await UserChat.findOne({
            where: {
              chatId: lstChat[i].id,
              userId: {
                [Op.ne]: req.rootUserId, // Sử dụng Op.ne để loại trừ userId = 1
              },
            },
            order: ["createdAt", "DESC"],
          });

          if (userChat == null) {
            res.status(200).send("Not found user chat!");
          }

          var userInChat = await User.findByPk(userChat.userId);
          lstChat[i].chatName = userInChat.name;
          lstChat[i].photo = userInChat.avatar;
        }
      }

      // search all chat friend

      // let listFriendId = await Friend.findAll({
      //   where: { senderId: req.rootUserId },
      // });
      // // let listFriends = [];
      // if (listFriendId != null) {
      //   for (let i = 0; i < listFriendId.length; i++) {

      // Lấy các user có name, email, phone có chứa key search, convert thành chatroom
      let user = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${keySearch}%` } },
            { email: { [Op.like]: `%${keySearch}%` } },
            { phone: { [Op.like]: `%${keySearch}%` } },
          ],
          // id: listFriendId[i].recipientId,
        },
      });

      if (user.length > 0) {
        for (var i = 0; i < user.length; i++) {
          lstChat.push({
            ["userId"]: user[i].id,
            chatName: user[i].name,
            photo: user[i].avatar,
          });
        }
      }

      //   }
      // }

      res.status(200).json(lstChat);
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }

  async getInfo(req, res) {
    const { chatId } = req.params;
    try {
      let chat = await Chat.findByPk(chatId);

      if (chat.typeChatId == 1) {
        let userChat = await UserChat.findOne({
          where: {
            chatId: chat.id,
            userId: {
              [Op.ne]: req.rootUserId, // Sử dụng Op.ne để loại trừ userId = req.rootUserId
            },
          },
        });

        if (userChat == null) {
          res.status(200).send("Not found user chat!");
        }

        let user = await User.findByPk(userChat.userId);

        if (chat.chatName == null) chat.chatName = user.name;
        chat.photo = user.avatar;

        res.status(200).json({ chat: chat, user: user });
      } else {
        let userChat = await UserChat.findAll({
          where: {
            chatId: chat.id,
            userId: {
              [Op.ne]: req.rootUserId,
            },
          },
        });

        if (userChat == null) {
          res.status(200).send("Not found user chat!");
        }

        let lstUser = [];
        for (let i = 0; i < userChat.length; i++) {
          let user = await User.findByPk(userChat[i].userId, {
            attributes: { exclude: ["password"] }, // Loại bỏ cột password khỏi kết quả trả về
          });
          lstUser.push(user);
        }

        res.status(200).json({ chat: chat, users: lstUser });
      }
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async creatGroup(req, res) {
    const { chatName, users } = req.body;
    try {
      let chat = await Chat.create({
        chatName: chatName,
        typeChatId: 2,
        numberOfMember: users.length + 1,
      });

      await UserChat.create({
        chatId: chat.id,
        userId: req.rootUserId,
      });

      for (let i = 0; i < users.length; i++) {
        await UserChat.create({
          chatId: chat.id,
          userId: users[i].id,
        });
      }
      res.status(200).json(chat);
    } catch (e) {
      res.status(500).json({ message: "Đã có lỗi xảy ra!" });
    }
  }
  async renameGroup(req, res) {
    const { chatId, chatName } = req.body;
    if (!chatId || !chatName)
      res.status(400).send("Provide Chat id and Chat name");
    try {
      const chat = await Chat.findByPk(chatId);

      await sequelize.query(
        `UPDATE Chats SET chatName = '${chatName}' where id = ${chatId}`
      );

      if (!chat) res.status(404);
      res.status(200).send(chat);
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }

  async updateChatPhoto(req, res) {
    try {
      const { chatId } = req.body;
      let file;
      let uploadPath;
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      // The name of the input field (i.e. "file") is used to retrieve the uploaded file
      file = req.files.file;

      uploadPath =
        "E:\\Do_An_5\\notip-client\\src\\assets\\images\\photo-chat\\" +
        file.name;

      // Use the mv() method to place the file somewhere on your server
      file.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });

      let chat = await Chat.update(
        {
          photo: "photo-chat\\" + file.name,
        },
        {
          where: { id: chatId },
        }
      );
      res.status(200).json(chat);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async addToGroup(req, res) {
    const { userId, chatId } = req.body;
    console.log(userId, chatId);
    // Cập nhật dữ liệu
    let userChat = await UserChat.create({
      userId: userId,
      chatId: chatId,
    });

    let chat = await Chat.findByPk(chatId);

    await Chat.update(
      { numberOfMember: chat.numberOfMember + 1 },
      { where: { id: chatId } }
    );

    if (!userChat) res.status(404);
    res.status(200).send(userChat);
    // } else {
    //     res.status(409).send('user already exists');
    // }
  }
  async removeGroup(req, res) {
    const { chatId } = req.body;
    try {
      const chat = await Chat.findByPk(chatId);
      if (chat) {
        await UserChat.destroy({
          where: { chatId: chat.id },
        });
        await Chat.destroy(chat);

        res.status(200).json({ message: "Xóa phòng chat thành công" });
      }
      res.status(400).json({ message: "Phòng chat không tồn tại" });
    } catch (e) {
      res.status(400).json({ message: "Có lỗi xảy ra khi xóa phòng chat" });
    }
  }
  async removeMemberInGroup(req, res) {
    const { userId, chatId } = req.body;
    try {
      let removeMember = await UserChat.destroy({
        where: { chatId: chatId, userId: userId },
      });
      if (removeMember > 0) {
        res
          .status(200)
          .json({ message: "Xóa người dùng khỏi nhóm chat thành công!" });
      }
      res
        .status(400)
        .json({ message: "Xóa người dùng khỏi nhóm chat không thành công!" });
    } catch (e) {
      res.status(500).json({ message: "Có lỗi xảy ra khi xóa người dùng!" });
    }
  }
  async removeGroupWhenNoMessage(req, res) {
    const { chatId } = req.body;
    try {
      const message = await Message.findOne({ where: { chatId: chatId } });
      if ((message.length = 0)) {
        await Chat.destroy({ where: { chatId: chatId } });
      }
      res.status(200);
    } catch (e) {
      res.status(500).json("Có lỗi xảy ra!");
    }
  }

  // api admin
  async getAllChatAdmin(req, res) {
    try {
      const chat = await Chat.findAll();
      for (let i = 0; i < chat.length; i++) {
        if (chat[i].typeChatId === 1) {
          let user = await sequelize.query(
            `SELECT u.* FROM users as u INNER JOIN userchats as uc on u.id = uc.userId WHERE uc.chatId = ${chat[i].id}`,
            { type: sequelize.QueryTypes.SELECT }
          );
          chat[i].chatName = `${user[0].name} - ${user[1].name}`;
          chat[i].photo = `${user[0].avatar}`;
        }
      }

      res.status(200).json(chat);
    } catch (e) {
      res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
  }

  async getDetailChatAdmin(req, res) {
    const { chatId } = req.params;
    console.log(chatId);
    try {
      let chat = await Chat.findByPk(chatId);
      let lstUser = [];

      let userChat = await UserChat.findAll({
        where: {
          chatId: chat.id,
        },
      });

      if (userChat == null) {
        res.status(200).send("Not found user chat!");
      }

      for (let i = 0; i < userChat.length; i++) {
        let user = await User.findByPk(userChat[i].userId, {
          attributes: { exclude: ["password"] }, // Loại bỏ cột password khỏi kết quả trả về
        });
        lstUser.push(user);
      }
      let messages = await Message.findAll({ where: { chatId: chat.id } });
      res.status(200).json({ chat: chat, users: lstUser, messages: messages });
    } catch (e) {
      res.status(500).json(e);
    }
  }
}

module.exports = ChatController;
