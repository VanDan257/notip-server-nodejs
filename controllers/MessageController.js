const Message = require("../models/Message");
const Chat = require("../models/Chat");
const sequelize = require("../mySQL/dbconnect");
const uploadToCloudinary = require("../utils/cloudinary.js");

class MessageController {
  async sendMessage(req, res) {
    const { chatId, content, type } = req.body;

    try {
      let file;
      let fileName;
      let chat = await Chat.findByPk(chatId);

      if (req.files) {
        // The name of the input field (i.e. "file") is used to retrieve the uploaded file
        file = req.files.file;
        fileName = file.name.split(".");

        const result = await uploadToCloudinary(file.data, {
          resource_type: "auto",
          folder: "attachment/" + chat.chatName,
          public_id: fileName[0],
        });
      }

      let msg = await Message.create({
        senderId: req.rootUserId,
        content: content,
        path:
          req.files != null
            ? "attachment/" +
              chat.chatName +
              "/" +
              fileName[0] +
              "." +
              fileName[1]
            : null,
        type: type,
        chatId: chatId,
      });

      msg.dataValues.senderPhoto = req.rootUser.avatar;
      msg.dataValues.senderName = req.rootUser.name;

      if (type == "media") msg.content = "Hình ảnh";

      let numberOfMessages = chat.numberOfMessage + 1;

      await Chat.update(
        {
          lastestMessage: msg.content,
          numberOfMessage: numberOfMessages,
        },
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

  // api admin
  async getAllMessagesAdmin(req, res) {
    try {
      const messages = await Message.findAll();
      res.status(200).json(messages);
    } catch (e) {
      res.staus(500).json({ message: "Có lỗi xảy ra!" });
    }
  }
}

module.exports = MessageController;
