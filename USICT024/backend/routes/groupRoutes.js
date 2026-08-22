const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupMembers,
  deleteGroup,
} = require("../controllers/groupController");


// Create group
router.post(
  "/",
  verifyToken,
  createGroup
);


// Join group
router.post(
  "/join",
  verifyToken,
  joinGroup
);


// Get my groups
router.get(
  "/",
  verifyToken,
  getMyGroups
);


// Get group members
router.get(
  "/:groupId/members",
  verifyToken,
  getGroupMembers
);


// Delete group
router.delete(
  "/:groupId",
  verifyToken,
  deleteGroup
);


module.exports = router;