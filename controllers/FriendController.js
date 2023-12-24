const Friend = require("../models/Friend");
const sequelize = require("../mySQL/dbconnect");
const User = require("../models/User");
const { Op } = require("sequelize");
const { QueryTypes } = require("sequelize");

class FriendController {
  async SendInvite(req, res) {
    const { recipientId } = req.body;
    try {
      const friendStatus = await Friend.create({
        senderId: req.rootUserId,
        recipientId: recipientId,
        friendStatusId: 1,
      });
      res.status(200).json(friendStatus);
    } catch (error) {
      res.status(500).send(error);
    }
  }
  async changeStatusFriend(req, res, friendStatusId) {
    const { recipientId } = req.body;

    try {
      await Friend.update(
        { friendStatusId: friendStatusId },
        { where: { recipientId: recipientId } }
      );

      res.status(200);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async removeBlockUser(req, res) {
    const { friendId } = req.body;
    try {
      const friend = await Friend.findByPk(friendId); // Tìm user dựa trên ID
      if (friend) {
        await friend.destroy(); // Xóa user
        res.status(200).json({ message: "Remove block user successfully" });
      } else {
        res.status(304).json({ message: "Remove block user failed" });
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async getListFriends(req, res) {
    try {
      let listFriendsId = await Friend.findAll({
        where: { senderId: req.rootUserId, friendStatusId: 2 },
      });

      let listFriends = [];
      if (listFriendsId) {
        for (let i = 0; i < listFriendsId.length; i++) {
          let user = await User.findByPk(listFriendsId[i].recipientId);
          if (user) listFriends.push(user);
        }
      } else {
        res.status(300).send("You haven't any friend yet;");
      }
      res.status(200).json(listFriends);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async getListFriendInvites(req, res) {
    try {
      let listFriendsId = await Friend.findAll({
        where: { recipientId: req.rootUserId, friendStatusId: 1 },
      });

      let listFriends = [];
      if (listFriendsId) {
        for (let i = 0; i < listFriendsId.length; i++) {
          let user = await User.findByPk(listFriendsId[i].senderId);
          if (user) listFriends.push(user);
        }
      } else {
        res.status(300).send("You haven't any friend yet;");
      }
      res.status(200).json(listFriends);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  async searchFriend(req, res) {
    const { name } = req.params;
    try {
      let listFriendId = await Friend.findAll({ where: { senderId: 1 } });
      let listFriends = [];
      if (listFriendId != null) {
        for (let i = 0; i < listFriendId.length; i++) {
          let user = await User.findAll({
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${name}%` } },
                { email: { [Op.like]: `%${name}%` } },
              ],
              id: listFriendId[i].recipientId,
            },
          });
          if (!user) listFriends.push(user);
        }
      } else {
        res.status(200).send("Don't found anyone");
      }
      res.status(200).json(listFriends);
    } catch (e) {
      res.status(500).send(e);
    }
  }
}

module.exports = FriendController;
