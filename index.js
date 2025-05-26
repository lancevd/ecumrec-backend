import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from './routes/users.routes.js';
import { connectDB } from "./libs/connectDB.js";
import studentProfileRoutes from "./routes/studentProfile.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5670;

app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "http://localhost:3500" : "https://ecumrec.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Define your routes here
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/student-profile", studentProfileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
