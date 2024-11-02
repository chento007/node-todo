const express = require('express');
const router = express.Router();

const {
    getJobs,
    createNewJob,
    updateJob,
    deleteJob,
    getJobByIdAndSlug,
    getJobStat,
    applyJob
} = require("../controllers/job.controller")

const { isAuthenicationedUser, authorizeRoles } = require("../middlewares/auth")

router.route("/:id/apply")
    .put(isAuthenicationedUser, authorizeRoles("user"), applyJob)

router.route("")
    .get(isAuthenicationedUser,getJobs)
    .post(isAuthenicationedUser, authorizeRoles("employee"), createNewJob)

router.route("/stats/:topic")
    .get(getJobStat)

router.route("/:id")
    .put(updateJob)
    .delete(deleteJob)

router.route("/:id/:slug")
    .get(getJobByIdAndSlug)

module.exports = router