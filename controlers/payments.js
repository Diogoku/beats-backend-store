// stripe
import stripe from "stripe";

// dotenv
import dotenv from "dotenv";
dotenv.config();

// uuid
import { v4 } from "uuid";

// validator
import { myValidationResult } from "../validators/user.js";

// models
import Product from "../models/product.js";

const Stripe = stripe(process.env.STRIPE_PK_TEST);

export const createCheckoutSession = async (req, res) => {
  // validator
  const errors = myValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const body = req.body;

  // products data to build line_items objetc
  const line_items = await Promise.all(
    body.line_items.map((item) =>
      Product.findById(item.id)
        .then((product) => {
          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: product.name,
                description: product.description.join("\r\n"),
                images: [product.image],
              },
              unit_amount: parseInt(product.price * 100),
            },
            quantity: item.quantity,
          };
        })
        .catch((err) => {
          return res
            .status(400)
            .json({ err: "Product not found. Checkout process cancelled" });
        })
    )
  );

  const session = await Stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: line_items,
    mode: "payment",
    success_url: process.env.FRONTEND_SUCCESS_PAYMENT_PAGE,
    cancel_url: process.env.FRONTEND_FAIL_PAYMENT_PAGE,
  });

  res.json({ id: session.id });
};

export const successfulPayment = async (req, res) => {
  const user = req.profile;
  const uuidv4 = await v4();

  const itemsPurchased = await {
    products: user.basketProducts,
    date: new Date().toISOString(),
    _id: uuidv4,
  };

  await user.buyHistory.push(itemsPurchased);
  user.basketProducts = await [];

  user
    .save()
    .then((updatedUser) => {
      const { _id, basketProducts, email, name, buyHistory } = updatedUser;
      return res
        .status(200)
        .json({ _id, basketProducts, email, name, buyHistory });
    })
    .catch((err) =>
      res.status(400).json({ err: "Something went wrong updating the user" })
    );
};
