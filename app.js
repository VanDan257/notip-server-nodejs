var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser"); // npm i body-parser
var fileUpLoad = require("express-fileupload"); // npm iexpress-fileupload
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const User = require("./models/User");
const UserChat = require("./models/UserChat");
var usersRouter = require("./routes/users");
var chatsRouter = require("./routes/chat");
var messageRouter = require("./routes/message");
var friendRouter = require("./routes/friend");
const sequelize = require("./mySQL/dbconnect");
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

// routers
app.use("/api", usersRouter);
app.use("/api/chat", chatsRouter);
app.use("/api/message", messageRouter);
app.use("/api/friend", friendRouter);

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
let userRoomChats = [];

chatNamespace.on("connection", (socket) => {
  socket.on("join-room", (room) => {
    userRoomChats.push(socket.id);
    socket.join(room);
  });
  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new-message", async (payload) => {
    console.log("chatName: ", payload.chatName);
    socket.to(payload.chatName).emit("message-received", payload);
  });

  socket.on("leave-room", () => {
    socket.leave("roomChat");
    userRoomChats = userRoomChats.filter((id) => id !== socket.id);
  });
});
