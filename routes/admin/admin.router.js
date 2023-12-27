const chatRouter = require("./chat.router");
const userRouter = require("./user.router");

const routerAdmin = (app) => {
  app.use("/api/admin/chat", chatRouter);
  app.use("/api/admin/user", userRouter);
};

module.exports = { routerAdmin };
