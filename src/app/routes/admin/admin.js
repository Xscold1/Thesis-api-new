const express = require('express')
const router = express.Router();
const adminController = require('../../controller/admin/admin')

router.post("/create-admin", adminController.ADD_ADMIN)
router.delete("/delete-admin/:id", adminController.DELETE_ADMIN)
router.get("/get-all-admin", adminController.GET_ALL_ADMIN)
router.put("/update-admin/:id", adminController.UPDATE_ADMIN)
router.get("/admin-dashboard", adminController.ADMIN_DASHBOARD)
module.exports = router