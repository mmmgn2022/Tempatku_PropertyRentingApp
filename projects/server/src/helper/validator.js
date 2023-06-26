const { check, validationResult } = require("express-validator");

module.exports = {
  checkUser: async (req, res, next) => {
    try {
      if (req.path == "/register") {
        await check("name")
          .notEmpty()
          .isLength({ max: 255 })
          .withMessage(
            "Name must not be empty and must be less than or equal to 255 characters."
          )
          .matches(/^[a-zA-Z ]+$/)
          .withMessage("Name must only contain letters and spaces.")
          .run(req);

        await check("email")
          .notEmpty()
          .isEmail()
          .withMessage("Invalid email address.")
          .run(req);

        await check("phone")
          .notEmpty()
          .isMobilePhone()
          .withMessage("Invalid phone number.")
          .run(req);

        await check("password")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);
      } else if (req.path == "/auth") {
        await check("email")
          .if((value, { req }) => !req.body.phone)
          .notEmpty({ nullable: true })
          .isEmail()
          .withMessage("Invalid email address.")
          .run(req);

        await check("phone")
          .if((value, { req }) => !req.body.email)
          .notEmpty({ nullable: true })
          .isMobilePhone()
          .withMessage("Invalid phone number.")
          .run(req);

        await check("password")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);
      } else if (req.path == "/change-password") {
        await check("password")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);

        await check("newPassword")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);

        await check("confirmationPassword")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);
      } else if (req.path == "/forgot-password") {
        await check("email")
          .notEmpty()
          .isEmail()
          .withMessage("Invalid email address.")
          .run(req);
      } else if (req.path == "/reset-password") {
        await check("newPassword")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);

        await check("confirmationPassword")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);
      } else if (req.path == "/register-as-tenant") {
        await check("name")
          .notEmpty()
          .isLength({ max: 255 })
          .withMessage(
            "Name must not be empty and must be less than or equal to 255 characters."
          )
          .matches(/^[a-zA-Z ]+$/)
          .withMessage("Name must only contain letters and spaces.")
          .run(req);

        await check("email")
          .notEmpty()
          .isEmail()
          .withMessage("Invalid email address.")
          .run(req);

        await check("phone")
          .notEmpty()
          .isMobilePhone()
          .withMessage("Invalid phone number.")
          .run(req);

        await check("password")
          .notEmpty()
          .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 0,
          })
          .withMessage(
            "Password must be at least 6 characters, includes a number, one uppercase letter, and one lowercase letter."
          )
          .run(req);
      } else if (req.path == "/edit-profile") {
        if (req.body.name) {
          await check("name")
            .notEmpty()
            .isLength({ max: 255 })
            .withMessage(
              "Name must not be empty and must be less than or equal to 255 characters."
            )
            .matches(/^[a-zA-Z ]+$/)
            .withMessage("Name must only contain letters and spaces.")
            .run(req);
        }

        if (req.body.email) {
          await check("email")
            .notEmpty()
            .isEmail()
            .withMessage("Invalid email address.")
            .run(req);
        }

        if (req.body.gender) {
          await check("gender")
            .notEmpty()
            .isIn(["Male", "Female"])
            .withMessage("Gender must not be empty.")
            .run(req);
        }

        if (req.body.birth) {
          await check("birth")
            .notEmpty()
            .isISO8601()
            .withMessage("Birthdate must be a valid date in ISO8601 format.")
            .custom((value) => {
              const currentDate = new Date();
              const birthdate = new Date(value);
              const minimumAgeDate = new Date(
                currentDate.getFullYear() - 18,
                currentDate.getMonth(),
                currentDate.getDate()
              );
              if (birthdate > minimumAgeDate) {
                throw new Error("You must be at least 18 years old.");
              }
              return true;
            })
            .isAfter("1899-12-31")
            .withMessage("Birth year cannot be lower than 1900-01-01.")
            .run(req);
        }

        if (req.body.account_number) {
          await check("account_number")
            .notEmpty()
            .isLength({ min: 10, max: 20 })
            .withMessage("Account number must be between 10 and 20 characters.")
            .matches(/^\d+$/)
            .withMessage("Account number must contain only digits.")
            .run(req);
        }
      }

      const validation = validationResult(req);

      if (validation.isEmpty()) {
        next();
      } else {
        return res.status(400).send({
          success: false,
          error: validation.errors,
        });
      }
    } catch (error) {
      console.log("checkUser validator error :", error);
      next(error);
    }
  },
};
