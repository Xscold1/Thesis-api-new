const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const USER_CONTROLLER = require("../../controller/user/user");

router.post("/login", USER_CONTROLLER.LOGIN_USER);
router.post("/register", USER_CONTROLLER.REGISTER_USER);
router.put("/update", USER_CONTROLLER.UPDATE_USER);
router.delete("/delete", USER_CONTROLLER.DELETE_USER);
router.post("/search-by-name", USER_CONTROLLER.SEARCH_USER_BY_NAME);
router.get("/get-by-id", USER_CONTROLLER.GET_USER_BY_ID);
router.get("/get-all-user", USER_CONTROLLER.GET_ALL_USER);
module.exports = router;
