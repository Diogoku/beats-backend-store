import expressValidator from "express-validator";
const { body } = expressValidator;

export const paymentsValidator = [
  body("line_items").notEmpty().withMessage("Line items are necessary"),
];
