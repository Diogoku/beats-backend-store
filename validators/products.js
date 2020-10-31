import expressValidator from "express-validator";
const { body } = expressValidator;

export const basketValidator = [
  body("quantity").isInt().withMessage("Quantity must be a positive integer"),
];
