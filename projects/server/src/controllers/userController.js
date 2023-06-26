const sequelize = require("sequelize");
const { join } = require("path");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createToken, createTokenForKTP } = require("../helper/jwt");
const fs = require("fs");
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Jakarta");

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
          const uuid = uuidv4();
          const { name, email, password, phone } = req.body;
          // create otp
          const otp = Math.floor(1000 + Math.random() * 9000);
          let regis = await model.user.create(
            {
              uuid,
              email,
              phone,
              password,
              roleId: 1,
              otp,
              otpCount: 1,
              otpCountDate: moment().format("YYYY-MM-DD"),
            },
            {
              transaction: ormTransaction,
            }
          );
          let regisUserDetail = await model.user_detail.create(
            {
              uuid,
              name,
              userId: regis.id,
            },
            {
              transaction: ormTransaction,
            }
          );
          let { id, roleId } = regis.dataValues;
          // generate token, must be 24 h
          let token = createToken({ id, roleId }, "24h");
          // create transporter object and configure Handlebars template
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
              pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
            },
          });
          transporter.use(
            "compile",
            hbs({
              viewEngine: {
                extname: ".html", // html extension
                layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                defaultLayout: "register-verification-email", // name of main template
                partialsDir: join(__dirname, "../helper"), // location of your subtemplates
              },
              viewPath: join(__dirname, "../helper"),
              extName: ".html",
            })
          );
          // send verification email
          await transporter.sendMail({
            from: "Tracker admin",
            to: req.body.email,
            subject: "Account Verification after Register",
            template: "register-verification-email",
            context: {
              name: req.body.name,
              link: `${process.env.FE_URL}/account/verification/${token}`,
              otp: otp,
            },
          });
          await ormTransaction.commit();
          return res.status(200).send({
            success: true,
            message:
              "Register success. You received an email to verify your account.",
            data: regis,
            regisUserDetail,
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Passwords do not match.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Email or phone number exist.",
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
      //find email or phone from db
      let getuser = await model.user.findAll({
        where: sequelize.or(
          { email: req.body.email },
          { phone: req.body.phone }
        ),
        include: [
          { model: model.user_detail },
          { model: model.role, attributes: ["role"] },
        ],
      });
      //if found compare hashed password with req.body.password
      if (getuser.length > 0) {
        //if google account throw error login have to by google
        if (getuser[0].dataValues.password !== "NULL") {
          let checkpw = bcrypt.compareSync(
            req.body.password,
            getuser[0].dataValues.password
          );
          //if isSuspended false & checkpw true ? reset pw attempts : pw attempts + 1
          if (checkpw && getuser[0].dataValues.isSuspended == 0) {
            //update the attempts field in the database with 0
            await model.user.update(
              { attempts: 0 },
              {
                where: {
                  id: getuser[0].dataValues.id,
                },
              }
            );
            let { id, uuid, email, phone, isSuspended, attempts, isVerified } =
              getuser[0].dataValues;
            let { name, birth, gender, image_profile, account_number } =
              getuser[0].user_detail;
            let role = getuser[0].dataValues.role.role;
            // generate token
            let token = createToken({ id, role, isSuspended }, "24h");
            // login success
            return res.status(200).send({
              success: true,
              message: "Login success",
              token,
              name,
              email,
              phone,
              role,
              attempts,
              isVerified,
              image_profile,
              gender,
              birth,
              uuid,
              account_number,
            });
          } else {
            //jika salah passwordnya attempt + 1 sampe 5 kali nanti akun suspended
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
                message: `Wrong password. Attempt number : ${
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
                message: "Account suspended. Please reset your password.",
              });
            }
          }
        } else {
          res.status(400).send({
            success: false,
            message: "Account not found.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Account not found.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //3. KEEP LOGIN
  keepLogin: async (req, res, next) => {
    try {
      let getuser = await model.user.findAll({
        where: {
          id: req.decrypt.id,
        },
        include: [
          { model: model.user_detail },
          { model: model.role, attributes: ["role"] },
        ],
      });
      let { id, uuid, email, phone, isSuspended, isVerified } =
        getuser[0].dataValues;
      let { name, birth, gender, image_profile, account_number } =
        getuser[0].user_detail;
      let role = getuser[0].dataValues.role.role;
      // generate token
      let token = createToken({ id, role, isSuspended }, "24h");
      // keep login success
      return res.status(200).send({
        success: true,
        message: "keep login success",
        token,
        name,
        email,
        phone,
        role,
        isVerified,
        image_profile,
        gender,
        birth,
        uuid,
        account_number,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //4. CHANGE PASSWORD
  changePassword: async (req, res, next) => {
    try {
      // get old password from user login
      let getData = await model.user.findAll({
        where: {
          id: req.decrypt.id,
        },
        attributes: ["password"],
      });
      // compare current password (hashed) & req.body.password
      if (getData.length > 0) {
        let comparecurrentpw = bcrypt.compareSync(
          req.body.password,
          getData[0].dataValues.password //currentpw
        );
        if (comparecurrentpw) {
          // compare newpassword & confirmationpassword
          if (req.body.newPassword == req.body.confirmationPassword) {
            // compare new password & current password (hashed)
            let comparecurrentandnewpw = bcrypt.compareSync(
              req.body.newPassword,
              getData[0].dataValues.password //currentpw
            );
            if (!comparecurrentandnewpw) {
              delete req.body.confirmationPassword;
              // hash right before update
              req.body.newPassword = bcrypt.hashSync(
                req.body.newPassword,
                salt
              );
              // update password field in database with req.body.newPassword & read token
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
                message: "Change password success.",
              });
            } else {
              res.status(400).send({
                success: false,
                message:
                  "Your new password cannot be the same as your current password.",
              });
            }
          } else {
            res.status(400).send({
              success: false,
              message: "New password and confirmation password do not match.",
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: "Current password is incorrect.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Current password not found.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //5. FORGOT PASSWORD
  forgotPassword: async (req, res, next) => {
    try {
      // get user data by email
      let getData = await model.user.findAll({
        where: {
          email: req.body.email,
        },
        include: [{ model: model.user_detail }],
      });
      if (getData.length > 0) {
      if (getData[0].dataValues.password !== "NULL") {
        // create otp
        const otp = Math.floor(1000 + Math.random() * 9000);
        // patch otp di database user
        await model.user.update(
          { otp: otp },
          {
            where: {
              email: getData[0].dataValues.email,
            },
          }
        );
        // create token to send by email
        let { id, roleId, isSuspended } = getData[0].dataValues;
        let { name } = getData[0].user_detail;
        let token = createToken({ id, roleId, isSuspended }, "1h");
        // create transporter object and configure Handlebars template
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
            pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
          },
        });
        transporter.use(
          "compile",
          hbs({
            viewEngine: {
              extname: ".html", // html extension
              layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
              defaultLayout: "reset-password-email", // name of main template
              partialsDir: join(__dirname, "../helper"), // location of your subtemplates
            },
            viewPath: join(__dirname, "../helper"),
            extName: ".html",
          })
        );
        // send reset pw email
        await transporter.sendMail({
          from: "Tracker admin",
          to: req.body.email,
          subject: "Reset Password",
          template: "reset-password-email",
          context: {
            name: name,
            link: `${process.env.FE_URL}/password/reset/${token}`,
            otp: otp,
          },
        });
        res.status(200).send({
          success: true,
          message: "Email to reset password has been delivered.",
          token,
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Account with this email not found.",
        });
      }
    } else {
      res.status(400).send({
        success: false,
        message: "Account with this email not found.",
      });
    }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //6. RESET PASSWORD
  resetPassword: async (req, res, next) => {
    try {
      if (req.body.newPassword == req.body.confirmationPassword) {
        // get otp from database
        let getotp = await model.user.findAll({
          where: {
            id: req.decrypt.id,
          },
          attributes: ["otp"],
        });
        const { otp } = req.body;
        // if otp from req.body the same with otp from database user can reset password
        if (otp == getotp[0].dataValues.otp) {
          // hash right before update
          req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt);
          // update the password & isSuspended
          await model.user.update(
            { password: req.body.newPassword, isSuspended: 0, attempts: 0 },
            {
              //read token
              where: {
                id: req.decrypt.id,
              },
            }
          );
          // set otp back to null (only 1 time use)
          await model.user.update(
            { otp: null },
            {
              where: {
                id: req.decrypt.id,
              },
            }
          );
          return res.status(200).send({
            success: true,
            message: "Reset password success.",
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Wrong verification code.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "New password and confirmation password do not match.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //7. REGISTER AS TENANT
  registerAsTenant: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      const base64Data = req.body.images.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      let checkExistingUser = await model.user.findAll({
        where: sequelize.or(
          { email: req.body.email },
          { phone: req.body.phone }
        ),
      });
      if (checkExistingUser == 0) {
        if (req.body.images.length > 0) {
          if (req.body.password == req.body.confirmationPassword) {
            delete req.body.confirmationPassword;
            const uuid = uuidv4();
            const { name, email, password, phone } = req.body;
            const hashedPassword = bcrypt.hashSync(password, salt);
            let regis = await model.user.create(
              {
                uuid,
                email,
                phone,
                password: hashedPassword,
                roleId: 2,
              },
              {
                transaction: ormTransaction,
              }
            );
            //encrypt into token
            let image_ktp = createTokenForKTP({ base64Data });
            let regisUserDetail = await model.user_detail.create(
              {
                uuid,
                name,
                image_ktp,
                userId: regis.id,
              },
              {
                transaction: ormTransaction,
              }
            );
            await ormTransaction.commit();
            return res.status(200).send({
              success: true,
              message: "Register success.",
              data: regis,
              regisUserDetail,
            });
          } else {
            res.status(400).send({
              success: false,
              message: "Passwords do not match.",
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: "Id card image file is required.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Email or phone number exist.",
        });
      }
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },

  //8. ACCOUNT VERIFICATION
  verify: async (req, res, next) => {
    try {
      let checkverifieduser = await model.user.findAll({
        where: {
          id: req.decrypt.id,
        },
      });
      let { otpCount, otpCountDate } = checkverifieduser[0].dataValues;
      if (!checkverifieduser[0].dataValues.isVerified) {
        // get otp from database
        let getotp = await model.user.findAll({
          where: {
            id: req.decrypt.id,
          },
          attributes: ["otp"],
        });
        const { otp } = req.body;
        // if otp from req.body the same with otp from database account can be verified
        if (otp == getotp[0].dataValues.otp) {
          let updateStatus = await model.user.update(
            { isVerified: 1, otpCount: 0, otpCountDate: null },
            {
              where: {
                id: req.decrypt.id,
              },
            }
          );
          // set otp back to null (only 1 time use)
          await model.user.update(
            { otp: null },
            {
              where: {
                id: req.decrypt.id,
              },
            }
          );
          return res.status(200).send({
            success: true,
            message: "Your account has been verified.",
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Wrong verification code.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Your account is already verified.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //9. SEND VERIFICATION EMAIL
  sendVerificationEmail: async (req, res, next) => {
    try {
      let checkverifieduser = await model.user.findAll({
        where: {
          id: req.decrypt.id,
        },
        include: [{ model: model.user_detail }],
      });
      // if user isnt verified yet, send verification email
      if (!checkverifieduser[0].dataValues.isVerified) {
        let { id, roleId, otpCount, otpCountDate } =
          checkverifieduser[0].dataValues;
        let { name } = checkverifieduser[0].user_detail;
        // get last time otpCount is updated (send otp email)
        const lastUpdateDate = moment(otpCountDate);
        // if last update date is not 'today' otpCount reset to zero
        if (!moment().isSame(lastUpdateDate, "day")) {
          otpCount = 0;
        }
        // if otpCount is 5 for the day, cannot send anymore verification email
        if (otpCount < 5) {
          const otp = Math.floor(1000 + Math.random() * 9000);
          await model.user.update(
            {
              otp: otp,
              otpCount: otpCount + 1,
              otpCountDate: moment().format("YYYY-MM-DD"),
            },
            {
              where: {
                id: req.decrypt.id,
              },
            }
          );
          // generate token, must be 24 h
          let token = createToken({ id, roleId }, "24h");
          // create transporter object and configure Handlebars template
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
              pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
            },
          });
          transporter.use(
            "compile",
            hbs({
              viewEngine: {
                extname: ".html", // html extension
                layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                defaultLayout: "account-verification-email", // name of main template
                partialsDir: join(__dirname, "../helper"), // location of your subtemplates
              },
              viewPath: join(__dirname, "../helper"),
              extName: ".html",
            })
          );
          // send verification email
          await transporter.sendMail({
            from: "Tracker admin",
            to: checkverifieduser[0].dataValues.email,
            subject: "Account Verification",
            template: "account-verification-email",
            context: {
              name: name,
              link: `${process.env.FE_URL}/account/verification/${token}`,
              otp: otp,
            },
          });
          return res.status(200).send({
            success: true,
            message: `You received an email to verify your account. Please check your email.
              OTP sent today : ${otpCount + 1}.`,
            checkverifieduser,
          });
        } else {
          res.status(400).send({
            success: false,
            message:
              "You have reached the maximum limit of OTP resend requests for today. Please try again tomorrow.",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Your account is already verified.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //10. EDIT PROFILE
  editProfile: async (req, res, next) => {
    try {
      const { name, email, birth, gender, account_number } = req.body;
      if (name || email || birth || gender) {
        await model.user.update(
          { email },
          {
            where: {
              id: req.decrypt.id,
            },
          }
        );
        await model.user_detail.update(
          { name, birth, gender, account_number },
          {
            where: {
              userId: req.decrypt.id,
            },
          }
        );
        return res.status(200).send({
          success: true,
          message: "Edit profile success.",
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Cannot change user data.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  //11. UPDATE PROFILE IMAGE
  updateProfileImage: async (req, res, next) => {
    try {
      // get current profile image
      let get = await model.user_detail.findAll({
        where: {
          userId: req.decrypt.id,
        },
        attributes: ["image_profile"],
      });
      // if old image exists, delete old replace with new
      if (
        fs.existsSync(
          join(__dirname, `../public${get[0].dataValues.image_profile}`)
        )
      ) {
        fs.unlinkSync(
          join(__dirname, `../public${get[0].dataValues.image_profile}`)
        );
      }
      await model.user_detail.update(
        {
          image_profile: `/profileImage/${req.files[0]?.filename}`,
        },
        {
          where: { userId: req.decrypt.id },
        }
      );
      res.status(200).send({
        success: true,
        message: "Profile photo changed.",
        profileimage: `/profileImage/${req.files[0]?.filename}`,
      });
    } catch (error) {
      // delete image if encountered error
      fs.unlinkSync(
        join(__dirname, `../public/profileImage/${req.files[0].filename}`)
      );
      console.log(error);
      next(error);
    }
  },
  //12. SHOW KTP PHOTO
  showKTP: async (req, res, next) => {
    try {
      // get current ktp photo
      let get = await model.user_detail.findAll({
        where: {
          userId: req.decrypt.id,
        },
        attributes: ["image_ktp"],
      });
      // output from db: binary data of the image
      // convert binary data to base64 encoded string
      let imageData = get[0].dataValues.image_ktp.toString("utf8");
      res.status(200).send(imageData);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
