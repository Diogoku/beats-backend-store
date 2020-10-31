import express from "express";

import Product from "../models/product.js";
import Category from "../models/category.js";

// import controlers
import {
  getAllProducts,
  getProductDescription,
} from "../controlers/products.js";
import category from "../models/category.js";

// router
const router = express.Router();

// routes
router.get("/", getAllProducts);
router.get("/:productId", getProductDescription);

export default router;
