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
//create express app
const app = exp();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
//body parser middleware
app.use(exp.json());
//path level middleware
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/auth", commonApp);

//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB connected");
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`server listening on ${port}`));
  } catch (err) {
    console.log("DB ERROR:", err.message);
  }
};
connectDB();

//to handle inavlid path
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `${req.url} is invalid` });
});

//to handle error
app.use((err, req, res, next) => {
  //console.log(err.name)
  //console.log(err.message)
  //validation error
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ message: "error occurred", error: err.message });
  }
  //cast error
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ message: "error occurred", error: err.message });
  }
  //any server side error
  res
    .status(500)
    .json({ message: "error occured", error: "server side error" });
});
