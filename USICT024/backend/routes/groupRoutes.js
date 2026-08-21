const express = require("express");
const router = express.Router();


const verifyToken = require("../middleware/authMiddleware");
const {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupMembers
} = require("../controllers/groupController");

router.post("/", verifyToken, createGroup);
router.post("/join", verifyToken, joinGroup);

router.get("/", verifyToken, getMyGroups);

router.get(
  "/:groupId/members",
  verifyToken,
  getGroupMembers
);

module.exports = router;