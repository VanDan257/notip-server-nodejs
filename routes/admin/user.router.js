const express = require("express");
const {
  Auth,
  checkUserRole,
  checkAdminRole,
  checkModeratorRole,
} = require("../../middleware/userAuth");
const router = express.Router();
const UserController = require("../../controllers/UserController");

const user = new UserController();

router.post("/login-admin", async (req, res) => {
  await user.loginAdmin(req, res);
});

router.post("/create-account-admin", async (req, res) => {
  await user.createAccountAdmin(req, res);
});

router.get("/get-all-client", async (req, res) => {
  await user.getAllClient(req, res);
});

module.exports = router;
