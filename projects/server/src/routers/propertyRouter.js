const route = require("express").Router();
const { propertyController } = require("../controllers");
const { readToken } = require("../helper/jwt");
const { checkUser } = require("../helper/validator");
const uploader = require("../helper/uploader");
const uploader2mb = require("../helper/uploader2");

route.get("/", propertyController.getAllProperty);
route.get("/filter", propertyController.filterProperty); // gak kepake
route.get("/room-available", propertyController.getRoomAvailable);
route.get("/detail", propertyController.getPropertyDetail);
route.get("/picture", propertyController.getPicturePropertyDetail);
route.get("/alltenants", propertyController.getAllPropertyTenant);
route.get("/provinces", propertyController.getProvince);
route.post("/regencies", propertyController.getRegencyByProvinceId);
route.post(
    "/create",
    readToken,
    uploader2mb("/ImgProperty", "PTY").array("images", 5),
    propertyController.addProperty
);
route.get("/data/:uuid", propertyController.getPropertyData);
route.patch("/edit/:uuid", propertyController.editProperty);
route.patch("/delete/:uuid", readToken, propertyController.deleteProperty);
route.get("/list", readToken, propertyController.listProperty);
route.patch(
    "/update-image",
    uploader2mb("/ImgProperty", "PTY").array("images", 1),
    propertyController.updateImageProperty
);
route.patch("/delete-image", propertyController.deletePropertyPicture);
route.get("/available", propertyController.getAvailableProperty);
route.get('/special-price/:uuid', propertyController.getSpecialPrice)

module.exports = route;
