const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ANALYTICS_CONTROLLER = require("../../controller/analytics/analytics");

router.get("/symptom-checker-analytics", auth, ANALYTICS_CONTROLLER.SYMPTOM_CHECKER_ANALYTICS);
router.get("/datasets-analytics",auth,ANALYTICS_CONTROLLER.DATASETS_ANALYTICS);
router.get("/variable-to-disease-relationship",auth, ANALYTICS_CONTROLLER.VARIABLE_TO_DISEASE_RELATIONSHIP);
router.get("/list-of-diseases",auth,ANALYTICS_CONTROLLER.LIST_OF_DISEASES);
router.get("/list-of-variables",auth, ANALYTICS_CONTROLLER.LIST_OF_VARIABLES);
router.get("/get-sc-cs-analytics-by-location", ANALYTICS_CONTROLLER.GET_SC_CS_ANALYTICS_BY_LOCATION);
router.get("/get-respondents-by-location", ANALYTICS_CONTROLLER.GET_OVERVIEW_ANALYTICS_BY_LOCATION);
router.get("/get-common-disease-analytics-by-location", ANALYTICS_CONTROLLER.GET_COMMON_DISEASE_ANALYTICS_BY_LOCATION);
router.get("/get-lifestyle-analytics-by-location", ANALYTICS_CONTROLLER.GET_LIFESTYLE_ANALYTICS_BY_LOCATION);
router.get("/symptoms-hotspot", ANALYTICS_CONTROLLER.MOST_SYMPTOMS_HOTSPOT);
router.get("/diseases-hotspot", ANALYTICS_CONTROLLER.MOST_DISEASE_HOTSPOT);

module.exports = router;
