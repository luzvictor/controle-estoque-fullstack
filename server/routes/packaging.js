const express = require("express");
const { createPackaging, getPackaging, updatePackaging, deletePackaging } = require("../controllers/packagingController");
const router = express.Router();

router.post("/", createPackaging);
router.get("/", getPackaging);
router.put("/:id", updatePackaging);
router.delete("/:id", deletePackaging)

module.exports = router;
