import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import categoriesRoutes from "./routes/categories.js";
import paymentsRoutes from "./routes/payments.js";

// app && port
const app = express();
const port = process.env.PORT || 9000;

// app config
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));

// db config
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(console.log("Connected to Mongo DB..."));

// routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/payments", paymentsRoutes);

// listener
app.listen(port, () => console.log(`App listening on port: ${port}`));
