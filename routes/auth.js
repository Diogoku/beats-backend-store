import express from "express";

// controlers
import { signup, signin, signout } from "../controlers/auth.js";

// validators
import { signupValidator, signinValidator } from "../validators/user.js";

// router
const router = express.Router();

// routes
router.post("/signup", signupValidator, signup);
router.post("/signin", signinValidator, signin);
router.post("/signout", signout);

export default router;
