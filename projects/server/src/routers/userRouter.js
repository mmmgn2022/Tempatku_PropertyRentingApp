const route = require("express").Router();
const {
  register,
  login,
  keepLogin,
  changePassword,
  forgotPassword,
  resetPassword,
  registerAsTenant,
  verify,
  sendVerificationEmail,
  editProfile,
  updateProfileImage,
  showKTP,
} = require("../controllers/userController");
const { readToken } = require("../helper/jwt");
const uploader = require("../helper/uploader");
const uploader3 = require("../helper/uploader3");
const { checkUser } = require("../helper/validator");

route.post("/register", checkUser, register);
route.post("/auth", checkUser, login);
route.get("/keep-login", readToken, keepLogin);
route.patch("/change-password", readToken, checkUser, changePassword);
route.post("/forgot-password", checkUser, forgotPassword);
route.patch("/reset-password", readToken, checkUser, resetPassword);
route.post("/register-as-tenant", uploader3("/imgIdCard", "IDC").array("images", 1), checkUser, registerAsTenant);
route.patch("/verify-account", readToken, verify);
route.get("/send-verification-email", readToken, sendVerificationEmail);
route.patch("/edit-profile", readToken, checkUser, editProfile);
route.patch("/update-profile-image", readToken, uploader("/profileImage", "PRF").array("image_profile", 1), updateProfileImage);
route.get("/show-ktp", readToken, showKTP);

module.exports = route;
