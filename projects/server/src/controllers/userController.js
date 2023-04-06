const sequelize = require("sequelize");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");
const transporter = require("../helper/nodemailer");
const fs = require("fs");

let salt = bcrypt.genSaltSync(10);

module.exports = {
  //1. REGISTER
  register: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      let checkExistingUser = await model.user.findAll({
        where: sequelize.or(
          { email: req.body.email },
          { phone: req.body.phone }
        ),
      });
      if (checkExistingUser == 0) {
        if (req.body.password == req.body.confirmationPassword) {
          delete req.body.confirmationPassword;
          req.body.password = bcrypt.hashSync(req.body.password, salt);
          console.log("Check data after hash password :", req.body); //testing purposes
          const uuid = uuidv4();
          const { name, email, password, phone } = req.body;
          //1. Create data baru
          let regis = await model.user.create(
            {
              uuid,
              email,
              phone,
              password,
              roleId: 1,
            },
            {
              transaction: ormTransaction,
            }
          );
          let regisUserDetail = await model.user_detail.create(
            {
              uuid,
              name,
              userId: regis.id, // Set userId to the id of the newly created user
            },
            {
              transaction: ormTransaction,
            }
          );
          console.log("ini isi dari regis :", regis);
          console.log("ini isi dari id regis :", regis.dataValues.id);
          console.log("ini isi dari regisUserDetail :", regisUserDetail);
          let { id, roleId } = regis.dataValues;
          // GENERATE TOKEN --> Q: cukup dari tabel user saja?
          let token = createToken({ id, roleId }, "24h");
          // SEND VERIFICATION MAIL
          await transporter.sendMail({
            from: "Tracker admin",
            to: req.body.email,
            subject: "Account Verification",
            html: `
            <div>
            <p>Hi ${name},</p>
            <p>We're happy you signed up for tempatku.</p>
            <p>Just click on the following link to verify and activate your account.</p>
            <a href="http://localhost:3000/verifyaccount/${token}">Verify Now</a> 
            <p>Please note this link will expire within 24 hours.</p>
            <br>
            <p>Welcome to tempatku!</p>
            <p>tempatku team</p>
            </div>
            `,
          });
          await ormTransaction.commit();
          return res.status(200).send({
            success: true,
            message:
              "register account success ✅ and you received an email to verify your account.",
            data: regis, regisUserDetail,
            token, //testing only
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Error❌: Passwords do not match.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Error❌: Email or phone number exist.",
        });
      }
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },

  //2. LOGIN
  login: async (req, res, next) => {
    try {
      //1. find email or phone from db  
      let getuser = await model.user.findAll({
        where: sequelize.or(
          { email: req.body.email },
          { phone: req.body.phone }
        ),
        include: [{ model: model.user_detail }]
      });
      console.log("ini getuser buat login :", getuser);
      console.log(
        "ini getuser[0].dataValues.attempts buat login :",
        getuser[0].dataValues.attempts
      );
      console.log("ini name dari user_detail getuser: ", getuser[0].user_detail.name);
      console.log("ini isi dari user_detail tabel getuser: ", getuser[0].user_detail);
      //2. if found compare hashed password with req.body.password
      if (getuser.length > 0) {
        let checkpw = bcrypt.compareSync(
          req.body.password,
          getuser[0].dataValues.password
        );
        //3. if isSuspended false 0 & checkpw true 1 ? reset pw attempts : pw attempts + 1
        if (checkpw && getuser[0].dataValues.isSuspended == 0) {
          //4. update the attempts field in the database with 0
          await model.user.update(
            { attempts: 0 },
            {
              where: {
                id: getuser[0].dataValues.id,
              },
            }
          );
          let {
            id,
            uuid,
            email,
            phone,
            roleId,
            isSuspended,
            attempts,
            isVerified,
          } = getuser[0].dataValues;
          let {
            name,
            birth,
            gender,
            image_profile,
          } = getuser[0].user_detail
          // GENERATE TOKEN ---> 400h buat gampang aja developnya jgn lupa diganti!
          let token = createToken({ id, roleId, isSuspended }, "400h"); //24 jam
          // LOGIN SUCCESS
          return res.status(200).send({
            success: true,
            message: "Login success ✅",
            token,
            name,
            email,
            phone,
            roleId, 
            attempts,
            isVerified,
            image_profile,
            gender,
            birth,
          });
        } else {
          //3. jika salah passwordnya attempt + 1 sampe 5 kali nanti suspended
          if (getuser[0].dataValues.attempts < 5) {
            await model.user.update(
              { attempts: getuser[0].dataValues.attempts + 1 },
              {
                where: {
                  id: getuser[0].dataValues.id,
                },
              }
            );
            res.status(400).send({
              success: false,
              message: `Wrong password ❌ attempt number : ${
                getuser[0].dataValues.attempts + 1
              }`,
            });
          } else {
            await model.user.update(
              { isSuspended: 1 },
              {
                where: {
                  id: getuser[0].dataValues.id,
                },
              }
            );
            res.status(400).send({
              success: false,
              message: "Account suspended ❌ please reset your password",
            });
          }
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Account not found ❌",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //3. KEEP LOGIN
  keeplogin: async (req, res, next) => {
    try {
      console.log("Decrypt token:", req.decrypt);
      let getuser = await model.user.findAll({
        where: {
          id: req.decrypt.id,
        },
        include: [{ model: model.user_detail }]
      });
      let {
        id,
        uuid,
        email,
        phone,
        roleId,
        isSuspended,
        isVerified,
      } = getuser[0].dataValues;
      let {
        name,
        birth,
        gender,
        image_profile,
      } = getuser[0].user_detail
      // GENERATE TOKEN ---> 400h buat gampang aja developnya jgn lupa diganti!
      let token = createToken({ id, roleId, isSuspended }, "400h"); //24 jam
      // KEEP LOGIN SUCCESS
      return res.status(200).send({
        success: true,
        message: "keep login success ✅",
        token,
        name,
        email,
        phone,
        roleId,
        isVerified,
        image_profile,
        gender,
        birth,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //4. CHANGE PASSWORD
  changepassword: async (req, res, next) => {
    try {
      //1. get old password from user yg login
      let getData = await model.user.findAll({
        where: {
          id: req.decrypt.id,
        },
        attributes: ["password"],
      });
      //1. compare current password (hashed) & req.body.password
      if (getData.length > 0) {
        let comparecurrentpw = bcrypt.compareSync(
          req.body.password,
          getData[0].dataValues.password //currentpw
        );
        if (comparecurrentpw) {
          //2. compare newpassword & confirmationpassword
          if (req.body.newPassword == req.body.confirmationPassword) {
            //3. compare new password & current password (hashed)
            let comparecurrentandnewpw = bcrypt.compareSync(
              req.body.newPassword,
              getData[0].dataValues.password //currentpw
            );
            if (!comparecurrentandnewpw) {
              delete req.body.confirmationPassword;
              //4. hash right before update
              req.body.newPassword = bcrypt.hashSync(
                req.body.newPassword,
                salt
              );
              //5. update the password field in the database with the value of req.body.newPassword & read token
              await model.user.update(
                { password: req.body.newPassword },
                {
                  where: {
                    id: req.decrypt.id,
                  },
                }
              );
              return res.status(200).send({
                success: true,
                message: "Change password success ✅",
              });
            } else {
              res.status(400).send({
                success: false,
                message:
                  "Error❌: Your new password cannot be the same as your current password.",
              });
            }
          } else {
            res.status(400).send({
              success: false,
              message:
                "Error❌: New password and confirmation password do not match.",
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: "Error❌: Current password is incorrect",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Error❌: Current password not found",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //5. FORGOT PASSWORD
  forgotpassword: async (req, res, next) => {
    try {
      //1. get user data by email
      let getData = await model.user.findAll({
        where: {
          email: req.body.email,
        },
        include: [{ model: model.user_detail }]
      });
      console.log("ini getData buat forgot pw :", getData);
      console.log("ini isi dari user_detail tabel getData: ", getData[0].user_detail);
      //2. create token to send by email
      let { id, roleId, isSuspended } = getData[0].dataValues;
      let { name } = getData[0].user_detail;
      let token = createToken({ id, roleId, isSuspended }, "1h"); // apa aja yg jd token? //1 jam (forgot pw dan verifikasi)
      //3. send reset pw email
      await transporter.sendMail({
        from: "Tracker admin",
        to: req.body.email,
        subject: "Reset Password",
        html: `
        <div>
        <p>Hi ${name},</p>
        <p>We've received a request to reset your password.</p>
        <p>To reset your password, click the following link</p>
        <a href="http://localhost:3000/resetpassword/${token}">Reset your password</a> 
        <br>
        <p>Thanks,</p>
        <p>tempatku team</p>
        </div>
        `,
      });
      res.status(200).send({
        success: true,
        message: "email to reset password has been delivered ✅",
        token,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //6. RESET PASSWORD
  resetpassword: async (req, res, next) => {
    try {
      if (req.body.newPassword == req.body.confirmationPassword) {
        console.log("Decrypt token : ", req.decrypt);
        //1. hash right before update
        req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt);
        //2. update the password & isSuspended
        await model.user.update(
          { password: req.body.newPassword, isSuspended: 0 },
          {
            //read token
            where: {
              id: req.decrypt.id,
            },
          }
        );
        return res.status(200).send({
          success: true,
          message: "Reset password success ✅",
        });
      } else {
        res.status(400).send({
          success: false,
          message:
            "Error❌: New password and confirmation password do not match.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //7. REGISTER AS TENANT
  registerastenant: async (req, res, next) => {
    try {
      console.log("req.body : ", req.body);
      console.log("req.files  : ", req.files);
      let checkExistingUser = await model.users_lama.findAll({
        where: sequelize.or(
          { email: req.body.email },
          { phone: req.body.phone }
        ),
      });
      if (checkExistingUser == 0) {
        if (req.files.length == 1) {
          if (req.body.password == req.body.confirmationPassword) {
            delete req.body.confirmationPassword;
            req.body.password = bcrypt.hashSync(req.body.password, salt);
            console.log("Check data after hash password :", req.body); //testing purposes
            const uuid = uuidv4();
            const { name, email, password, phone } = req.body;
            let regis = await model.users_lama.create({
              uuid,
              name,
              email,
              phone,
              image_ktp: `/imgIdCard/${req.files[0]?.filename}`,
              password,
              roleId: 2,
            });
            return res.status(200).send({
              success: true,
              message: "register account success ✅",
              data: regis,
            });
          } else {
            res.status(400).send({
              success: false,
              message: "Error❌: Passwords do not match.",
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: "Error❌: Image file is required",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Error❌: Email or phone number exist.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //8. ACCOUNT VERIFICATION
  verify: async (req, res, next) => {
    try {
      console.log("Decrypt token:", req.decrypt);
      let checkverifieduser = await model.users_lama.findAll({
        where: {
          id: req.decrypt.id,
        },
      });
      // console.log("ini isi checkverifieduser :", checkverifieduser);
      console.log(
        "ini isi isVerified dari checkverifieduser :",
        checkverifieduser[0].dataValues.isVerified
      );
      if (!checkverifieduser[0].dataValues.isVerified) {
        let updateStatus = await model.users_lama.update(
          { isVerified: 1 },
          {
            where: {
              id: req.decrypt.id,
            },
          }
        );
        console.log("isi updateStatus : ", updateStatus);
        return res.status(200).send({
          success: true,
          message: "Your Account has been Verified ✅",
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Your account is already verified",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //9. SEND VERIFICATION EMAIL
  sendverificationemail: async (req, res, next) => {
    try {
      console.log("Decrypt token:", req.decrypt);
      //find user by read token from login
      let checkverifieduser = await model.users_lama.findAll({
        where: {
          id: req.decrypt.id,
        },
      });
      console.log("ini isi checkverifieduser :", checkverifieduser);
      console.log(
        "ini isi checkverifieduser isVerified :",
        checkverifieduser[0].dataValues.isVerified
      );
      //if user isnt verified yet, send verification email
      if (!checkverifieduser[0].dataValues.isVerified) {
        let { id, roleId, name } = checkverifieduser[0].dataValues;
        // GENERATE TOKEN
        let token = createToken({ id, roleId }, "24h");
        // SEND VERIFICATION MAIL
        await transporter.sendMail({
          from: "Tracker admin",
          to: checkverifieduser[0].dataValues.email,
          subject: "Account Verification",
          html: `
          <div>
          <p>Hi ${name},</p>
          <p>We noticed your account has not been verified.</p>
          <p>Just click on the following link to verify and activate your account.</p>
          <a href="http://localhost:3000/verifyaccount/${token}">Verify Now</a> 
          <p>Please note this link will expire within 24 hours.</p>
          <br>
          <p>Thanks,</p>
          <p>tempatku team</p>
          </div>
          `,
        });
        return res.status(200).send({
          success: true,
          message:
            "You received an email to verify your account. Please check your email.",
        });
      } else {
        //message jgn dikeluarin (hidden?), continue lsg ke transaction page
        res.status(400).send({
          //what should it be?
          success: false,
          message:
            "Your account is already verified, you can continue to transaction page",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //10. EDIT PROFILE
  editprofile: async (req, res, next) => {
    try {
      console.log("Decrypt token:", req.decrypt);
      const { name, email, birth, gender } = req.body;
      if (name || email || birth || gender) {
        await model.users_lama.update(req.body, {
          where: {
            id: req.decrypt.id,
          },
        });
        return res.status(200).send({
          success: true,
          message: "Edit profile success ✅",
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Error❌: Cannot change user data",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //11. UPDATE PROFILE IMAGE
  updateprofileimage: async (req, res, next) => {
    try {
      //1. get current profile image
      let get = await model.users_lama.findAll({
        where: {
          id: req.decrypt.id,
        },
        attributes: ["image_profile"],
      });
      console.log(
        "ini isi dari get image_profile updateprofileimage: ",
        get[0].dataValues.image_profile
      );
      //2. if old image exists, delete old replace with new
      if (fs.existsSync(`./src/public${get[0].dataValues.image_profile}`)) {
        fs.unlinkSync(`./src/public${get[0].dataValues.image_profile}`);
      }
      await model.users_lama.update(
        {
          image_profile: `/profileImage/${req.files[0]?.filename}`,
        },
        {
          where: { id: req.decrypt.id },
        }
      );
      res.status(200).send({
        success: true,
        message: "Profile photo changed ✅",
        profileimage: `/profileImage/${req.files[0]?.filename}`,
      });
    } catch (error) {
      //delete image if encountered error
      fs.unlinkSync(`./src/public/profileImage/${req.files[0].filename}`);
      console.log(error);
      next(error);
    }
  },
};
