const Friend = require("../models/Friend");
const User = require("../models/User");
const { Op } = require("sequelize");
const sequelize = require("../mySQL/dbconnect");

class FriendController {
  async SendInvite(req, res) {
    const { recipientId } = req.body;
    console.log(recipientId);
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
    const { senderId } = req.body;

    try {
      await Friend.update(
        { friendStatusId: friendStatusId },
        {
          where: {
            [Op.and]: [{ senderId: senderId }, { recipientId: req.rootUserId }],
          },
        }
      );

      res.status(200).json({ message: "Đã thêm vào danh sách bạn bè!" });
    } catch (e) {
      res.status(500).json({ message: "Đã có lỗi xảy ra!" });
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
          if (user) listFriends.push({ ...user.dataValues, statusFriend: 2 });
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

  async searchUserInInvitedPage(req, res) {
    const { keySearch } = req.params;
    try {
      console.log(keySearch);
      let listUserSearch = [];
      let locIdUsers = [];

      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${keySearch}%` } },
            { email: { [Op.like]: `%${keySearch}%` } },
            { phone: { [Op.like]: `%${keySearch}%` } },
          ],
          [Op.and]: [{ id: { [Op.not]: req.rootUserId } }],
        },
      });

      for (const user of users) {
        // người dùng hiện tại là người gửi lmkb (statusFriend: 1)
        const currentUserIsSender = await Friend.findOne({
          where: {
            [Op.and]: [{ senderId: req.rootUserId }, { recipientId: user.id }],
          },
        });
        if (currentUserIsSender != null) {
          listUserSearch.push({ ...user.dataValues, statusFriend: 1 });
          locIdUsers.push(currentUserIsSender.recipientId);
        }

        // người dùng hiện tại là người được gửi lmkb (statusFriend: 2)
        const currentUserIsRecipient = await Friend.findOne({
          where: {
            [Op.and]: [{ senderId: user.id }, { recipientId: req.rootUserId }],
          },
        });
        if (currentUserIsRecipient != null) {
          listUserSearch.push({ ...user.dataValues, statusFriend: 2 });
          locIdUsers.push(currentUserIsSender.recipientId);
        }
      }

      let filterUsers = users.filter((item) => !locIdUsers.includes(item.id));

      listUserSearch.push(...filterUsers);

      res.status(200).json(listUserSearch);
    } catch (e) {
      res.status(500).send({ message: "Đã có lỗi xảy ra!" });
    }
  }
}

module.exports = FriendController;
