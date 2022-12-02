const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const SYMPTOM_CHECKER_CONTROLLER = require("../../controller/symptom-checker/symptom-checker");

router.post("/predict",  SYMPTOM_CHECKER_CONTROLLER.PREDICT);
router.get("/logs", auth, SYMPTOM_CHECKER_CONTROLLER.GET_LOGS);
router.get("/supported-symptoms", SYMPTOM_CHECKER_CONTROLLER.GET_SUPPORTED_SYMPTOMS);
router.get("/models-accuracy", auth, SYMPTOM_CHECKER_CONTROLLER.GET_MODELS_ACCURACY);
router.get("/symptoms-additional-info", SYMPTOM_CHECKER_CONTROLLER.SYMPTOM_ADDITIONAL_INFO);
module.exports = router;
