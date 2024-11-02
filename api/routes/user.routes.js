const express = require('express');
const router = express.Router();

const { isAuthenicationedUser, authorizeRoles } = require("../middlewares/auth")
const { getUerProfile, updatePassword, updateUser, deleteUser } = require("../controllers/user.controller")

router.route("/me")
    .get(isAuthenicationedUser, getUerProfile)
    .put(isAuthenicationedUser, updateUser)
    .delete(isAuthenicationedUser,deleteUser)
    
router.route("/password/change").put(isAuthenicationedUser, updatePassword);


module.exports = router