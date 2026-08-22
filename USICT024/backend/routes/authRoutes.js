const express = require("express");

const router = express.Router();

const {
    signup,
    login,
    deleteAccount
} = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/signup", signup);

router.post("/login", login);

router.delete(
    "/delete-account",
    verifyToken,
    deleteAccount
);

module.exports = router;