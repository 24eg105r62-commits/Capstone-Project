import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import { userApp } from "./APIs/UserAPI.js";
import { commonApp } from "./APIs/CommonAPI.js";
import { authorApp } from "./APIs/AuthorAPI.js";
import { adminApp } from "./APIs/AdminAPI.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

// create express app
const app = exp();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local frontend
      "import.meta.env.VITE_API_URL", // deployed frontend
    ],
    credentials: true,
  })
);

app.use(cookieParser());

// body parser middleware
app.use(exp.json());

// path level middleware
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/auth", commonApp);

// connect to DB
const connectDB = async () => {
  try {
    console.log("DB_URL =", process.env.DB_URL);

    await connect(process.env.DB_URL);

    console.log("DB connected");

    const port = process.env.PORT || 4000;

    app.listen(port, () =>
      console.log(`server listening on ${port}`)
    );
  } catch (err) {
    console.log("DB ERROR:", err);
  }
};

connectDB();

// handle invalid path
app.use((req, res, next) => {
  console.log(req.url);

  res.status(404).json({
    message: `${req.url} is invalid`,
  });
});

// global error handler
app.use((err, req, res, next) => {
  // validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  // server error
  res.status(500).json({
    message: "error occurred",
    error: "server side error",
  });
});