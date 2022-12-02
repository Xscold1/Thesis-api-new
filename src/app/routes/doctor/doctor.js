const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const doctorController = require("../../controller/doctor/doctor");
const upload = require('../../middleware/upload');

router.post("/add-dataset", auth, doctorController.ADD_DATASET);
router.post("/doctor-register",auth,upload.single('image'), doctorController.CREATE_DOCTOR);
router.delete("/delete-doctor", auth, doctorController.DELETE_DOCTOR);
router.put("/update-doctor", auth, upload.single('image'),doctorController.UPDATE_DOCTOR);
router.get("/get-doctor-by-name", doctorController.GET_DOCTOR_BY_NAME);
router.get("/get-doctor-by-id", doctorController.GET_DOCTOR_BY_ID);
router.get("/get-all-doctor", doctorController.GET_ALL_DOCTOR);
router.get("/get-all-doctor-by-specialization", doctorController.GET_DOCTOR_BY_SPECIALIZATION);
router.post("/create-affiliation/:doctorId", auth, doctorController.CREATE_AFFILIATION);
router.get("/get-doctor-affiliations/:doctorId", auth, doctorController.GET_ALL_DOCTOR_AFFILIATIONS);
router.get("/get-doctor-affiliation-info/:affiliationId", auth, doctorController.GET_ALL_AFFILIATION_INFO);
router.put("/update-affiliation/:affiliateId", auth, doctorController.UPDATE_AFFILIATION);
router.delete("/delete-affiliation/:affiliateId", auth, doctorController.DELETE_AFFILIATION);
router.get("/get-all-doctor-specialization", doctorController.GET_ALL_SPECIALIZATION);
router.get("/get-hospital-by-affiliation", doctorController.GET_HOSPITAL_BY_AFFILIATATION);

module.exports = router;
