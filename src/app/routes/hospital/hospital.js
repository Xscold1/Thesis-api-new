const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const hospitalController = require("../../controller/hospital/hospital");
const upload = require('../../middleware/upload');

router.post("/add-hospital", auth, upload.single('image'),  hospitalController.ADD_HOSPITAL)
router.delete("/delete-hospital", auth, hospitalController.DELETE_HOSPITAL)
router.put("/update-hospital", auth, upload.single('image'), hospitalController.UPDATE_HOSPITAL)
router.get("/get-hospital-by-id", hospitalController.GET_HOSPITAL_BY_NAME)
router.get("/get-all-hospital", hospitalController.GET_ALL_HOSPITAL)
router.get("/get-facility-by-id", hospitalController.GET_FACILITY_BY_ID)
router.post("/add-hospital-facility/:id", auth, upload.single('image'),hospitalController.ADD_HOSPITAL_FACILITY)
router.delete("/delete-hospital-facility/:facilityId", auth, hospitalController.DELETE_HOSPITAL_FACILITY)
router.put("/update-hospital-facility/:facilityId", auth, upload.single('image'), hospitalController.UPDATE_HOSPITAL_FACILITY)
router.get("/hospital-facilities/:hospitalId", auth, hospitalController.GET_ALL_FACILITY_BY_HOSPITAL_ID)
router.post("/get-hospital-by-location", hospitalController.GET_HOSPITAL_BY_BARANGAY)
module.exports = router