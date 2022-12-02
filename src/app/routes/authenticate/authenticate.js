const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const AUTHENTICATE_CONTROLLER = require("../../controller/authenticate/authenticate");

router.get("/", auth, AUTHENTICATE_CONTROLLER.AUTHENTICATE);

module.exports = router;
