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

router.post("/login-admin", Auth, async (req, res) => {
  await user.loginAdmin(req, res);
});

router.post(
  "/create-account-admin",
  Auth,
  checkModeratorRole,
  async (req, res) => {
    await user.createAccountAdmin(req, res);
  }
);

router.get("/get-all-client", Auth, checkAdminRole, async (req, res) => {
  await user.getAllClient(req, res);
});

router.get("/get-all-admins", Auth, checkModeratorRole, async (req, res) => {
  await user.getAllAdmins(req, res);
});

router.get(
  "/get-info-admin/:adminId",
  Auth,
  checkModeratorRole,
  async (req, res) => {
    await user.getInfoAdmin(req, res);
  }
);

router.delete("/delete-admin", Auth, checkModeratorRole, async (req, res) => {
  await user.deleteUser(req, res);
});

module.exports = router;
