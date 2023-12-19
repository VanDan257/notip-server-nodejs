const Message = require('../models/Message')
const Chat = require('../models/Chat');
const User = require("../models/User");
const sequelize = require("../mySQL/dbconnect");

class MessageController{
    async sendMessage(req, res) {
        const { chatId, content, type } = req.body;

        try{
            let user = await User.findByPk(1) // req.rootUserId

            let file;
            if (req.files) {
                // The name of the input field (i.e. "file") is used to retrieve the uploaded file
                file = req.files.file;
                // const year = `${new Date().getFullYear()}`;
                let uploadPath = "E:\\Do_An_5\\notip-client\\src\\assets\\images\\attachment\\" + file.name;

                // Use the mv() method to place the file somewhere on your server
                file.mv(uploadPath, function (err) {
                    if (err) {
                        console.log('error: ', err)
                        return res.status(500).send(err);
                    }
                });

            }

            let msg = await Message.create({
                senderId: 1, //user.id
                content: content,
                path: (req.files != null ? ("attachment\\" + file.name) : null),
                type: type,
                chatId: chatId,
                // senderName: user.name,
                // senderPhoto: user.avatar
            });

            await Chat.update(
                {latestMessage: msg.message},
                {where:
                        {id: chatId}
                }
            );

            res.status(200).json(msg);
        }
        catch (error){
            console.log(error);
            res.status(500).json({ error: error });
        }
    }

    async getMessages(req, res){
        const {chatId}=req.params;
        try{
            // const messages = await Message.findAll(
            //   {where: {chatId: chatId}},
            //   {include: [{
            //     model: User,
            // }],}
            // );
            const messages = await sequelize.query(`SELECT m.*, u.name as \`senderName\`, u.avatar as \`senderPhoto\` FROM messages as m INNER join users as u on m.senderId = u.id WHERE chatId = ${chatId} ORDER BY createdAt ASC`)

            res.status(200).json(messages[0]);
        }
        catch (error) {
            res.status(500).json({error: error});
            console.log(error);
        }
    }
}

module.exports = MessageController;
