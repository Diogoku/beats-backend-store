import express from "express";

// controlers
import {
  userById,
  productById,
  userAddProductToBasket,
  userRemoveProductFromBasket,
} from "../controlers/user.js";
import { requireSignin, isAuth } from "../controlers/auth.js";

// validators
import { basketValidator } from "../validators/products.js";

// router
const router = express.Router();

router.get("/secret/:userId", requireSignin, (req, res) => {
  res.json({ user: req.profile });
});

// user products
router.post(
  "/:userId/add/:productId",
  basketValidator,
  requireSignin,
  isAuth,
  userAddProductToBasket
);
router.post(
  "/:userId/remove/:productId",
  basketValidator,
  requireSignin,
  isAuth,
  userRemoveProductFromBasket
);

router.param("userId", userById);
router.param("productId", productById);

export default router;
