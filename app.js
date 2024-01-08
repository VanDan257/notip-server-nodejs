const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser"); // npm i body-parser
const fileUpLoad = require("express-fileupload"); // npm iexpress-fileupload
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const { router } = require("./routes/index");
const { routerAdmin } = require("./routes/admin/admin.router");
const { createServer } = require("http");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// Cài đặt CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// uploadfile
app.use(fileUpLoad());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// config router
router(app);
routerAdmin(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(process.env.PORT, () => {
  console.log(`Server Listening at PORT - ${process.env.PORT}`);
});

const chatNamespace = io.of("/chat");
let userRoomChats = {};

chatNamespace.on("connection", (socket) => {
  socket.on("setup", (name) => {
    userRoomChats[name] = socket.id;
    socket.join(name);
  });

  socket.on("join-room", (room) => {
    // nếu userRoomChats chưa có thuộc tính tên là room thì khai báo thuộc tính đó là 1 mảng rỗng
    if (!userRoomChats.hasOwnProperty(room)) {
      userRoomChats[room] = [];
    }
    userRoomChats[room].push(socket.id);
    socket.join(room);
  });

  socket.on("new-message", async (payload) => {
    console.log(userRoomChats);
    socket.to(payload.chatName).emit("message-received", payload);
  });

  socket.on("leave-room", () => {
    socket.leave("roomChat");
  });

  // Nhận và chuyển tiếp offer từ người gọi đến phòng chat (những người đang kết nối tới phòng chat đó)
  socket.on("offer", (data) => {
    console.log(data);
    const receiverSocketId = userRoomChats[data.room];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("offer", {
        senderName: data.senderName,
        offer: data.offer,
      });
    }
  });

  // Nhận và chuyển tiếp answer từ những người nhận đến người gọi
  socket.on("answer", (data) => {
    console.log(data);
    const senderSocketId = userRoomChats[data.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("answer", {
        room: data.room,
        answer: data.answer,
      });
    }
  });

  // Nhận và chuyển tiếp ICE candidate từ người gọi đến phòng chat hoặc ngược lại
  socket.on("ice-candidate", (data) => {
    console.log(data);
    const targetSocketId = connectedUsers[data.targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        candidate: data.candidate,
      });
    }
  });
});
