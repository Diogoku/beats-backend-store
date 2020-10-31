import express from "express";

// import controlers
import { getAllCategories } from "../controlers/categories.js";

// router
const router = express.Router();

// routes
router.get("/", getAllCategories);

export default router;
