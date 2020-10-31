import mongoose from "mongoose";

const CategorySchema = mongoose.Schema(
  {
    promoText: {
      type: String,
      required: true,
      unique: true,
      maxLength: 500,
    },
    products: [mongoose.model("Product").schema],
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
