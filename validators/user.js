import expressValidator from "express-validator";
const { body, validationResult } = expressValidator;

// my validation result, this prevents to send the value frm the failed field
export const myValidationResult = validationResult.withDefaults({
  formatter: (error) => {
    return {
      msg: error.msg,
      param: error.param,
      location: error.location,
    };
  },
});

// signup validator
export const signupValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name field is required")
    .isLength({ max: 32 })
    .withMessage("Name must have less than 32 characters"),
  body("email")
    .isEmail()
    .withMessage("Email field must be an email")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({
      min: 4,
      max: 32,
    })
    .withMessage("Email must be between 4 and 32 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password field is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches("[0-9]")
    .withMessage("Password must contain at least one digit")
    .matches("[a-z]")
    .withMessage("Password must contain at least a lowercase letter")
    .matches("[A-Z]")
    .withMessage("Password must contain at least a uppercase letter"),
];

export const signinValidator = [
  body("email")
    .isEmail()
    .withMessage("Email field must be an email")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({
      min: 4,
      max: 32,
    })
    .withMessage("Email must be between 4 and 32 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password field is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches("[0-9]")
    .withMessage("Password must contain at least one digit")
    .matches("[a-z]")
    .withMessage("Password must contain at least a lowercase letter")
    .matches("[A-Z]")
    .withMessage("Password must contain at least a uppercase letter"),
];
