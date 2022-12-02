const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const DATASET_CONTROLLER = require("../../controller/dataset/dataset");

router.post("/create", auth, DATASET_CONTROLLER.CREATE);
router.get("/get-datasets", auth, DATASET_CONTROLLER.GET_DATASETS);
router.get("/disease-symptoms",auth, DATASET_CONTROLLER.DISEASE_SYMPTOMS);
router.put("/update-dataset",auth, DATASET_CONTROLLER.UPDATE_DATASET);
router.post("/add-dataset", auth, DATASET_CONTROLLER.ADD_DATASET);
router.get("/total-datasets", auth, DATASET_CONTROLLER.TOTAL_NUMBER_OF_DATASETS);
router.get("/datasets-per-disease", auth, DATASET_CONTROLLER.NUMBER_OF_DATASETS_PER_DISEASE);
router.delete("/delete-dataset/:datasetId", auth, DATASET_CONTROLLER.DELETE_DATASET);

module.exports = router;
