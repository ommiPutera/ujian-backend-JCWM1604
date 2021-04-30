const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { verifyTokenAccess } = require("../helpers/verifyToken");

const {
  Register,
  Login,
  ActivateAccount,
  DeactiveAccount,
  CloseAccount
} = userController;

router.post("/register", Register);
router.post("/login", verifyTokenAccess, Login);
router.patch("/activate", verifyTokenAccess, ActivateAccount);
router.patch("/deactive", verifyTokenAccess, DeactiveAccount);
router.patch("/close", verifyTokenAccess, CloseAccount);

module.exports = router;