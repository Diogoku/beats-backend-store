import dotenv from "dotenv";
dotenv.config();

// validator
import { myValidationResult } from "../validators/user.js";

// token
import jwt from "jsonwebtoken"; // to generate signed token
import expressJwt from "express-jwt"; // for authorization check

// User model
import User from "../models/user.js";

// error handler
import { errorHandler } from "../helpers/dbErrorHandler.js";

// signup
export const signup = (req, res) => {
  // validator
  const errors = myValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // create user
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) return res.status(400).json({ err: errorHandler(err) });
    user.loginAttempts = undefined;
    user.lockUntil = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;
    user.password = undefined;
    res.json({ user });
  });
};

//signin
export const signin = (req, res) => {
  // validator
  const errors = myValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // body
  const { body } = req;

  // attempt to authenticate user
  User.getAuthenticated(body.email, body.password, function (
    err,
    user,
    reason
  ) {
    if (err) throw err;

    // login was successful if we have a user
    if (user) {
      // generate a signed token with user id and secret
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      // persist the token as token in cookie with expiry date
      res.cookie("token", token, { expire: new Date() + 9999 });
      // return response with user and token to frontend client
      const { _id, name, email, basketProducts, buyHistory } = user;
      return res.status(200).json({
        token,
        user: { _id, name, email, basketProducts, buyHistory },
      });
    }

    // otherwise we can determine why we failed
    const reasons = User.failedLogin;
    switch (reason) {
      case reasons.MAX_ATTEMPTS:
        return res.status(400).json({
          err:
            "Unavailable due to excessive failed attempts. Try again in a few hours",
        });
      case reasons.NOT_FOUND:
      case reasons.PASSWORD_INCORRECT:
        return res
          .status(400)
          .json({ err: "User with that email does not exist. Please signup" });
    }
  });
};

// logout
export const signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ msg: "Signout success" });
};

// require signin
export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: [process.env.ALGORITHMS],
});

// is auth
export const isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) return res.status(403).json({ err: "Access denied" });
  next();
};

// is admin
export const isAdmin = (req, res, next) => {
  if (req.profile.role === 0)
    return res.status(403).json({ err: "Admin resource! Access denied" });
  next();
};
