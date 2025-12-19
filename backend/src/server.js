import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { port } from "./config/index.js";

const app = express();

app.use(cors());
app.use(express.json());

//Routes

//1- authentication
app.use("/auth", authRoutes);

//2- Sessions
app.use("/sessions", sessionRoutes);

//3- User Profile
app.use("/user", userRoutes);

//4- Quote
app.use("/quote", quoteRoutes);

//5- Settings
app.use("/settings", settingsRoutes);

//Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
