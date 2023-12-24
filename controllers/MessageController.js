const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");
const sequelize = require("../mySQL/dbconnect");
const { where } = require("sequelize");

class MessageController {
  async sendMessage(req, res) {
    const { chatId, content, type } = req.body;

    try {
      let file;
      if (req.files) {
        // The name of the input field (i.e. "file") is used to retrieve the uploaded file
        file = req.files.file;
        let uploadPath =
          "E:\\Do_An_5\\notip-client\\src\\assets\\images\\attachment\\" +
          file.name;

        // Use the mv() method to place the file somewhere on your server
        file.mv(uploadPath, function (err) {
          if (err) {
            console.log("error: ", err);
            return res.status(500).send(err);
          }
        });
      }

      let msg = await Message.create({
        senderId: req.rootUserId,
        content: content,
        path: req.files != null ? "attachment\\" + file.name : null,
        type: type,
        chatId: chatId,
      });

      msg.dataValues.senderPhoto = req.rootUser.avatar;
      msg.dataValues.senderName = req.rootUser.name;

      if (type == "media") msg.content = "Hình ảnh";
      // await sequelize.query(
      //   `update chats set lastestMessage = '${msg.content}' where id = ${chatId}`
      // );

      await Chat.update(
        { lastestMessage: msg.content },
        { where: { id: chatId } },
        { individualHooks: true }
      );

      res.status(200).json(msg);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }

  async getMessages(req, res) {
    const { chatId } = req.params;
    try {
      const messages = await sequelize.query(
        `SELECT m.*, u.name as \`senderName\`, u.avatar as \`senderPhoto\` FROM messages as m INNER join users as u on m.senderId = u.id WHERE chatId = ${chatId} ORDER BY createdAt ASC`
      );

      res.status(200).json(messages[0]);
    } catch (error) {
      res.status(500).json({ error: error });
      console.log(error);
    }
  }
}

module.exports = MessageController;
