// User model
import User from "../models/user.js";

// Product model
import Product from "../models/product.js";

// validator
import { myValidationResult } from "../validators/user.js";

// error handler
import { errorHandler } from "../helpers/dbErrorHandler.js";

// when userId request param appear, check if the user exists
export const userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) return res.status(400).json({ err: "User not found" });
    req.profile = user;
    next();
  });
};

// when productId request param appear, check if the product exists
export const productById = (req, res, next, productId) => {
  Product.findById(productId).exec((err, product) => {
    if (err || !product)
      return res.status(400).json({ err: "Product not found" });
    req.product = product;
    next();
  });
};

export const userAddProductToBasket = async (req, res) => {
  // validator
  const errors = myValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // body
  const body = req.body;
  const product = req.product;
  const user = req.profile;

  // update stock
  product.stock -= await body.quantity;
  // save product
  await product.save((err) => {
    if (err) return res.status(400).json({ err: errorHandler(err) });
  });

  // update user
  User.findOneAndUpdate(
    { _id: user._id, "basketProducts.id": product.id },
    {
      $inc: { "basketProducts.$.quantity": parseInt(body.quantity) },
      $set: {
        "basketProducts.$.name": product.name,
        "basketProducts.$.price": product.price,
      },
    },
    { new: true, upsert: true }
  )
    .then((updatedUser) =>
      res.status(200).json({ basketProducts: updatedUser.basketProducts })
    )
    .catch(() => {
      user.basketProducts.push({
        id: product.id,
        quantity: parseInt(body.quantity),
        name: product.name,
        price: product.price,
      });
      user.save((err, user) => {
        if (err) return res.status(400).json({ err: errorHandler(err) });
        res.status(200).json({ basketProducts: user.basketProducts });
      });
    });
};

export const userRemoveProductFromBasket = async (req, res) => {
  // validator
  const errors = myValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // body
  const body = req.body;
  const product = req.product;
  const user = req.profile;

  // update stock
  product.stock += await parseInt(body.quantity);
  // save product
  await product.save((err) => {
    if (err) {
      return res.status(400).json({ err: errorHandler(err) });
    }
  });

  // update user
  await user.basketProducts.map((basketProduct, index) => {
    if (basketProduct.id === product.id) {
      if (basketProduct.quantity - parseInt(body.quantity) <= 0) {
        user.basketProducts.splice(index, 1);
      } else {
        basketProduct.quantity -= parseInt(body.quantity);
      }
    } else if (index === user.basketProducts.length - 1) {
      console.log("nao está no cesto?");
      return res.status(400).json({ err: "product is not in the basket" });
    }
  });

  user.markModified("basketProducts");

  await user.save((err, updatedUser) => {
    console.log(updatedUser);
    if (err) return res.status(400).json({ err: errorHandler(err) });
    else res.status(200).json({ basketProducts: updatedUser.basketProducts });
  });
};
