import express from "express";

// controlers
import { userById } from "../controlers/user.js";
import { requireSignin, isAuth } from "../controlers/auth.js";
import {
  createCheckoutSession,
  successfulPayment,
} from "../controlers/payments.js";

// validators
import { paymentsValidator } from "../validators/payments.js";

// router
const router = express.Router();

router.post(
  "/:userId/create-checkout-session",
  paymentsValidator,
  requireSignin,
  isAuth,
  createCheckoutSession
);

router.post(
  "/:userId/successful-payment",
  requireSignin,
  isAuth,
  successfulPayment
);

router.param("userId", userById);

export default router;
