// Product model
import Product from "../models/product.js";

// get all products
export const getAllProducts = (req, res) => {
  Product.find((err, products) => {
    if (err || !products)
      return res.status(400).json({ err: "Beats store, has no products" });
    let productsInfo = [];
    products.forEach((product) => {
      const { _id, name, rating, price, image } = product;
      productsInfo.push({ _id, name, rating, price, image });
    });
    return res.status(200).json({ products: productsInfo });
  });
};

// get product full description
export const getProductDescription = (req, res) => {
  Product.findById(req.params.productId, (err, product) => {
    if (err || !product)
      return res.status(404).json({ err: "Product not found" });
    const {
      _id,
      name,
      description,
      promoText,
      colors,
      price,
      image,
      stock,
    } = product;
    return res
      .status(200)
      .json({ _id, name, description, promoText, colors, price, image, stock });
  });
};
