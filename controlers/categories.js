// Category model
import Category from "../models/category.js";

// get all categories
export const getAllCategories = (req, res) => {
  Category.find((err, categories) => {
    if (err || !categories)
      return res.status(400).json({ err: "Beats store, has no categories" });
    let categoriesInfo = [];
    categories.forEach((category) => {
      const { _id, promoText, products } = category;
      categoriesInfo.push({ _id, promoText, products });
    });
    return res.status(200).json({ categories: categoriesInfo });
  });
};
