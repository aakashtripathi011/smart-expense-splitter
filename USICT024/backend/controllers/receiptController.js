const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

const createReceipt = (req, res) => {
    res.json({
        message: "Receipt uploaded successfully",
        file: req.file,
    });
};

module.exports = {
    upload,
    createReceipt,
};