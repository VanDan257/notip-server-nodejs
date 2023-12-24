const User = require("../models/User");
const Chat = require("../models/Chat");
const UserChat = require("../models/UserChat");
const Message = require("../models/Message");
const { Op } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");
const Friend = require("../models/Friend");

class ChatController {
  async accessChats(req, res) {
    const { userId } = req.body;
    if (!userId) res.send({ message: "Provide User's Id" });
    let chatExists = await Chat.findAll({
      where: {
        isGroup: false,
        [Op.and]: [
          { "$users.id$": userId }, // Tìm chat có người dùng có ID là userId
          { "$users.id$": req.rootUserId }, // Và cũng có người dùng có ID là rootUserId
        ],
      },
      include: [
        {
          model: User,
          as: "users",
          attributes: { exclude: ["password"] }, // Loại bỏ trường password
        },
        {
          model: Message,
          as: "latestMessage",
        },
      ],
    });

    if (chatExists.length > 0) {
      res.status(200).send(chatExists[0]);
    } else {
      let data = {
        chatName: "sender",
        users: [userId, req.rootUserId],
        isGroup: false,
      };
      try {
        const newChat = await Chat.create(data);
        const chat = await Chat.findByPk(newChat.id, {
          include: [
            {
              model: User,
              as: "users",
              attributes: { exclude: ["password"] }, // Loại bỏ trường password
            },
          ],
        });
        res.status(200).json(chat);
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }

  async fetchAllChats(req, res) {
    try {
      let chats = await sequelize.query(
        "SELECT `Chats`.*  FROM `Chats` AS `Chats` INNER JOIN ( `UserChats` AS `Users->UserChats` INNER JOIN `Users` AS `Users` ON `Users`.`id` = `Users->UserChats`.`userId`) ON `Chats`.`id` = `Users->UserChats`.`chatId` AND `Users`.`id` = " +
          req.rootUserId +
          " ORDER BY `Chats`.`updatedAt` DESC;"
      );

      const lstChat = chats[0];

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
          " ORDER BY `Chats`.`updatedAt` DESC;"
      );

      const lstChat = chats[0];

      for (let i = 0; i < lstChat.length; i++) {
        if (lstChat[i].typeChatId == 1) {
          var userChat = await UserChat.findOne({
            where: {
              chatId: lstChat[i].id,
              userId: {
                [Op.ne]: req.rootUserId, // Sử dụng Op.ne để loại trừ userId = 1
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

      // search all chat friend

      let listFriendId = await Friend.findAll({
        where: { senderId: req.rootUserId },
      });
      // let listFriends = [];
      if (listFriendId != null) {
        for (let i = 0; i < listFriendId.length; i++) {
          let user = await User.findOne({
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${keySearch}%` } },
                { email: { [Op.like]: `%${keySearch}%` } },
                { phone: { [Op.like]: `%${keySearch}%` } },
              ],
              id: listFriendId[i].recipientId,
            },
          });
          console.log(user);
          if (user != null)
            lstChat.push({
              ["userId"]: user.id,
              chatName: user.name,
              photo: user.avatar,
            });
        }
      }

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
    const { chatName, typeChatId, userIds } = req.body;

    console.log(typeof userIds);

    let chat = await Chat.create({
      chatName: chatName,
      typeChatId: typeChatId,
    });

    await UserChat.create({
      chatId: chat.id,
      userId: 1, // req.rootUserId
    });

    for (let i = 0; i < userIds.length; i++) {
      await UserChat.create({
        chatId: chat.id,
        userId: userIds[i],
      });
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
    // Cập nhật dữ liệu
    const userChat = await UserChat.create({
      userId: userId,
      chatId: chatId,
    });

    if (!userChat) res.status(404);
    res.status(200).send(userChat);
    // } else {
    //     res.status(409).send('user already exists');
    // }
  }
  async removeFromGroup(req, res) {
    const { userId, chatId } = req.body;
    const existing = await Chat.findOne({ where: { id: chatId } });
    if (existing.users.includes(userId)) {
      // Cập nhật dữ liệu để loại bỏ userId khỏi mảng users
      await sequelize.query(
        `UPDATE Chats SET users = array_remove(users, ${userId}) WHERE id = ${chatId}`
      );

      // Sau đó, truy vấn để lấy dữ liệu đã được cập nhật
      const updatedChat = await Chat.findByPk(chatId, {
        include: [
          {
            model: User,
            as: "groupAdmin",
            attributes: { exclude: ["password"] },
          },
          {
            model: User,
            as: "users",
            attributes: { exclude: ["password"] },
          },
        ],
      });

      if (updatedChat) {
        res.status(200).send(updatedChat);
      } else {
        res.status(404).send("Chat not found");
      }
    } else {
      res.status(409).send("user doesnt exists");
    }
  }
  async removeContact(req, res) {}
}

module.exports = ChatController;
