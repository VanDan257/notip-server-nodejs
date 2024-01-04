const Message = require("../models/Message");
const Chat = require("../models/Chat");
const sequelize = require("../mySQL/dbconnect");
const cloudinary = require("../utils/cloudinary.js");

class MessageController {
  async sendMessage(req, res) {
    const { chatId, content, type } = req.body;

    try {
      let file;
      let url;
      let fileName;
      if (req.files) {
        // The name of the input field (i.e. "file") is used to retrieve the uploaded file
        file = req.files.file;
        fileName = file.name.split(".");
        // fileName[0] = this.replaceSpecialVietnameseCharacters(fileName[0]);
        const folderName = "attachment"; // Thay đổi thành tên thư mục bạn muốn
        // Upload file vào thư mục chỉ định trên Cloudinary từ buffer của file
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: folderName,
              public_id: fileName[0],
            }, // Sử dụng tùy chọn folder
            (error, result) => {
              if (error) {
                console.error(error);
                return res.status(500).json({ error: "Upload failed" });
              } else {
                url = result.secure_url;
                console.log(result.secure_url);
              }
            }
          )
          .end(file.data);
      }

      console.log(url);

      let msg = await Message.create({
        senderId: req.rootUserId,
        content: content,
        path:
          req.files != null
            ? "attachment\\" + fileName[0] + "." + fileName[1]
            : null,
        type: type,
        chatId: chatId,
      });

      msg.dataValues.senderPhoto = req.rootUser.avatar;
      msg.dataValues.senderName = req.rootUser.name;

      if (type == "media") msg.content = "Hình ảnh";

      let chat = await Chat.findByPk(chatId);
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
