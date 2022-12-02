const express = require("express");
const router = express.Router();
const DISEASE_CONTROLLER = require('../../controller/disease/disease')
const auth = require("../../middleware/auth");

router.post("/add-disease", auth, DISEASE_CONTROLLER.ADD_DISEASE)
router.get("/get-disease-information", DISEASE_CONTROLLER.DISEASE_INFORMATION)
router.get("/get-all-disease-information", DISEASE_CONTROLLER.GET_ALL_DISEASE_INFORMATION)
router.put("/update-disease-information", auth, DISEASE_CONTROLLER.UPDATE_DISEASE_INFO)
router.delete("/delete-disease-information", auth, DISEASE_CONTROLLER.DELETE_DISEASE_INFO)

module.exports = router;