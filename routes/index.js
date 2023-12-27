const usersRouter = require("./users");
const chatsRouter = require("./chat");
const messageRouter = require("./message");
const friendRouter = require("./friend");

const router = (app) => {
  app.use("/api", usersRouter);
  app.use("/api/chat", chatsRouter);
  app.use("/api/message", messageRouter);
  app.use("/api/friend", friendRouter);
};

module.exports = { router };
