import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken.js";
const { sign } = jwt;
export const commonApp = exp.Router();
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
config();

//Route for register
commonApp.post(
  "/users",
  upload.single("profileImageUrl"),
  async (req, res, next) => {
    let cloudinaryResult;
    try {
      let allowedRoles = ["USER", "AUTHOR"];
      //get user from req
      const newUser = req.body;
      console.log(newUser);
      console.log(req.file);

      //check role
      if (!allowedRoles.includes(newUser.role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      //Upload image to cloudinary from memoryStorage
      if (req.file) {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      }

      // console.log("cloudinaryResult", cloudinaryResult);
      //add CDN link(secure_url) of image to newUserObj
      newUser.profileImageUrl = cloudinaryResult?.secure_url;

      //run validators manually
      //hash password and replace plain with hashed one
      newUser.password = await hash(newUser.password, 12);

      //create New user document
      const newUserDoc = new UserModel(newUser);

      //save document
      await newUserDoc.save();
      //send res
      res.status(201).json({ message: "User created" });
    } catch (err) {
      console.log("err is ", err);
      //delete image from cloudinary
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      }
      next(err);
    }
  },
);

//Route for Login(USER, AUTHOR and ADMIN)
commonApp.post("/login", async (req, res) => {
  //console.log(req.body)
  //get user cred obj
  const { email, password } = req.body;
  //find user by email
  const user = await UserModel.findOne({ email: email });
  //if use not found
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }
  //compare password
  const isMatched = await compare(password, user.password);
  //if passwords not matched
  if (!isMatched) {
    return res.status(400).json({ message: "Invalid password" });
  }
  //create jwt
  const signedToken = sign(
    {
      id: user._id,
      email: email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    },
  );

  //set token to res header as httpOnly cookie
  res.cookie("token", signedToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  //remove password from user document
  let userObj = user.toObject();
  delete userObj.password;

  //send res
  res.status(200).json({ message: "login success", payload: userObj });
});

//Route for Logout
commonApp.get("/logout", (req, res) => {
  //delete token from cookie storage
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  //send res
  res.status(200).json({ message: "Logout success" });
});

//Page refresh
commonApp.get(
  "/check-auth",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "authenticated",
      payload: req.user,
    });
  },
);

//change password
commonApp.put(
  "/password",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res) => {
    //get current and new password from user
    const { currentPassword, newPassword } = req.body;
    //check current password and new password are same
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "passwords are same.please give other password" });
    }
    //get current password of user/admin/author
    const user = await UserModel.findById(req.user.id);

    //check the curent password of req and user are not same
    let isMatched = await compare(currentPassword, user.password);
    if (!isMatched) {
      return res
        .status(400)
        .json({
          message: "the current password is invalid please enter current pass",
        });
    }

    //hash new password
    const newUserPassword = await hash(newPassword, 12);
    //replace current password of user with hashed new password
    await UserModel.updateOne(
      { _id: req.user.id },
      { $set: { password: newUserPassword } },
    );
    /*//save
    const user = await UserModel.findById(req.user._id)
    user.password = newUserPassword
      await user.save()*/
    //sand res
    res.status(200).json({ message: "password changed successfully" });
  },
);
