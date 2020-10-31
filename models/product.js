import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxLength: 500,
    },
    promoText: {
      type: String,
      required: true,
      maxLength: 500,
    },
    colors: [String],
    description: [String],
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
