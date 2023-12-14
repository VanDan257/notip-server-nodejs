const User = require("../models/User");
const Chat = require("../models/Chat");
const UserChat = require("../models/UserChat");
const Message = require("../models/Message");
const { Op } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");

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

    // chatExists = await user.populate(chatExists, {
    //     path: 'latestMessage.sender',
    //     select: 'name email profilePic',
    // });
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
          1 + // req.rootUserId +
          " ORDER BY `Chats`.`updatedAt` DESC;"
      );

      const lstChat = chats[0];

      for (let i = 0; i < lstChat.length; i++) {
        if(lstChat[i].typeChatId == 1){
          var userChat = await UserChat.findOne({
            where: {
              chatId: Chat.id,
              userId: {
                [Op.ne]: 1 // req.rootUserId, // Sử dụng Op.ne để loại trừ userId = 1
              },
            }
          });

          if(userChat == null){
            res.status(200).send("Not found user chat!")
          }

          var user = await User.findByPk(userChat.id);
          lstChat[i].name = user.name;
          lstChat[i].photo = user.avatar;

        }
      }

      res.status(200).json(chats[0]);
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
  async creatGroup(req, res) {
    const { chatName, users } = req.body;
    if (!chatName || !users) {
      res.status(400).json({ message: "Please fill the fields" });
    }
    const parsedUsers = JSON.parse(users);
    console.log("parsedUsers: ", parsedUsers);
    if (parsedUsers.length < 2)
      res.send(400).send("Group should contain more than 2 users");
    parsedUsers.push(req.rootUser);
    try {
      const chat = await Chat.create({
        chatName: chatName,
        users: parsedUsers,
        isGroup: true,
        groupAdmin: req.rootUserId,
      });
      const createdChat = await Chat.findByPk(chat.id, {
        include: [
          {
            model: User,
            as: "users",
            attributes: { exclude: ["password"] },
          },
          {
            model: User,
            as: "groupAdmin",
            attributes: { exclude: ["password"] },
          },
        ],
      });
      // res.status(200).json(createdChat);
      res.send(createdChat);
    } catch (error) {
      res.sendStatus(500);
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
  async addToGroup(req, res) {
    const { userId, chatId } = req.body;
    // const existing = await Chat.findOne({where: { id: chatId }});
    // if (!existing.users.includes(userId)) {
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
