const Server = require("socket.io");
const sequelize = require("../mySQL/dbconnect");
const UserChat = require("../models/UserChat");
const User = require("../models/User");

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Listening at PORT - ${process.env.PORT}`);
});

const io = new Server.Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.BASE_URL,
  },
});
io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });
  socket.on("join room", (room) => {
    socket.join(room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieve) => {
    console.log(newMessageRecieve);
    var chatId = newMessageRecieve.chatId;
    if (chatId == null) {
      console.log("chats is not defined");
    }

    const users = User.findAll({
      include: [
        {
          model: UserChat,
          where: { chatId: chatId },
        },
      ],
    });

    console.log(users);

    //   if (!chat.users) console.log("chats.users is not defined");
    users.forEach((user) => {
      //   if (user.id == newMessageRecieve.senderId) return;
      socket.in(user.id).emit("message recieved", newMessageRecieve);
    });
  });
});

module.exports = io;
