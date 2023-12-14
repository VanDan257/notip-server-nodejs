const Message = require('../models/Message')
const Chat = require('../models/Chat');

class MessageController{
    async sendMessage(req, res) {
        const { chatId, message } = req.body;

        try{
            // let msg = new Message();
            let msg = await Message.create({
                senderId: 2, //req.rootUserId
                content: message,
                chatId: chatId
            });

            await Chat.update(
                {latestMessage: msg.id},
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
        const {chatId}=req.query;
        console.log(req.params)
        try{
            const chatRoom = await Message.findAll(chatId);

            res.status(200).json(chatRoom);
        }
        catch (error) {
            res.sendStatus(500).json({error: error});
            console.log(error);
        }
    }
}

module.exports = MessageController;
