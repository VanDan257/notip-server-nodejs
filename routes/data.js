const express = require("express");
const router = express.Router();

router.post("/upload", function (req, res) {
  let file;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "file") is used to retrieve the uploaded file
  file = req.files.file;
  uploadPath = "../app/public/images/" + file.name;

  // Use the mv() method to place the file somewhere on your server
  file.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    res.send("File uploaded!");
  });
});

module.exports = router;
