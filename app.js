var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser"); // npm i body-parser
var fileUpLoad = require("express-fileupload"); // npm iexpress-fileupload
const cors = require("cors");
// const http = require("http");
// const socketIo = require("socket.io");
// const server = http.createServer(app);
// const io = socketIo(server);
const Server = require("socket.io");
require("dotenv").config();
var usersRouter = require("./routes/users");
var chatsRouter = require("./routes/chat");
var messageRouter = require("./routes/message");
var friendRouter = require("./routes/friend");

var app = express();

// Cài đặt CORS
app.options("*", cors());

const corsOptions = {
  origin: process.env.BASE_URL,
};

app.use(cors(corsOptions));

// const corsConfig = {
//   origin: process.env.BASE_URL,
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsConfig));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));

// uploadfile
app.use(fileUpLoad());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

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
    var chat = newMessageRecieve.chatId;
    if (!chat.users) console.log("chats.users is not defined");
    chat.users.forEach((user) => {
      if (user.id == newMessageRecieve.sender.id) return;
      socket.in(user.id).emit("message recieved", newMessageRecieve);
    });
  });
});

// module.exports = app;
