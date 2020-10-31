import mongoose from "mongoose";
import bcrypt from "bcrypt"; // encrypt password

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Number,
    },
    role: {
      type: Number,
      default: 0,
    },
    basketProducts: {
      type: Array,
      default: [],
    },
    buyHistory: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// middleware
UserSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(parseInt(process.env.SALT_ITERATIONS), function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// user schema methods
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.incLoginAttempts = function (cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne(
      { $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } },
      cb
    );
  }
  // otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (
    this.loginAttempts + 1 >= process.env.MAX_LOGIN_ATTEMPTS &&
    !this.isLocked
  ) {
    updates.$set = {
      lockUntil: new Date(Date.now() + 1 * 60000),
    };
  }
  return this.updateOne(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference
const reasons = (UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2,
});

// Authenticate user
UserSchema.statics.getAuthenticated = function (email, password, cb) {
  this.findOne({ email: email }, function (err, user) {
    if (err) return cb(err);

    // make sure the user exists
    if (!user) return cb(null, null, reasons.NOT_FOUND);

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incLoginAttempts(function (err) {
        if (err) return cb(err);
        return cb(null, null, reasons.MAX_ATTEMPTS);
      });
    }

    // test for a matching password
    user.comparePassword(password, function (err, isMatch) {
      if (err) return cb(err);

      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
        // reset attempts and lock info
        const updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 },
        };
        return user.updateOne(updates, function (err) {
          if (err) return cb(err);
          return cb(null, user);
        });
      }

      // password is incorrect, so increment login attempts before responding
      user.incLoginAttempts(function (err) {
        if (err) return cb(err);
        return cb(null, null, reasons.PASSWORD_INCORRECT);
      });
    });
  });
};

// virtual fields
UserSchema.virtual("isLocked").get(function () {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// expose enum on the model
UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2,
};

export default mongoose.model("User", UserSchema);
