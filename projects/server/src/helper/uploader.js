const multer = require("multer");
const fs = require("fs");
const { join } = require("path");

const uploader = (directory, filePreFix) => {
  // 1. default directory storage
  let defaultDir = join(__dirname, "../public");

  // 2. storage location config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const storeDir = directory ? defaultDir + directory : defaultDir;
      if (fs.existsSync(storeDir)) {
        cb(null, storeDir);
      } else {
        fs.mkdir(storeDir, { recursive: true }, (error) => {
          if (error) {
            console.log("error create directory : ", error);
          }
          cb(error, storeDir);
        });
      }
    },
    filename: (req, file, cb) => {
      let ext =
        file.originalname.split(".")[file.originalname.split(".").length - 1];

      let newName = filePreFix + Date.now() + "." + ext;
      cb(null, newName);
    },
  });

  //3. file filter config
  const fileFilter = (req, file, cb) => {
    const extFilter = /\.(jpg|jpeg|gif|png)/;
    let checkExt = file.originalname.toLowerCase().match(extFilter);
    if (checkExt) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .jpg, .jpeg, .png, and .gif format allowed!"));
    }
  };
  
  //4. set file size limit
  const limits = {
    fileSize: 1024 * 1024, // 1 MB
  };
  
  //5. return multer
  return multer({ storage, fileFilter, limits });
};

module.exports = uploader;
