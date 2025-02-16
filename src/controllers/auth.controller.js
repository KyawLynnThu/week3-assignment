import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

const authController = {
  register: async (req, res) => {
    let profile_photo_path = "";
    let cover_photo_path = "";

    try {
      const { username, email, password } = req.body;

      if ([username, email, password].some((fields) => fields?.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Email or Username already exists" });
      }

      if (req.files.profile_photo) {
        profile_photo_path = req.files.profile_photo[0].path;
      }
      if (req.files.cover_photo) {
        cover_photo_path = req.files.cover_photo[0].path;
      }

      let profile_photo = "";
      let cover_photo = "";

      if (profile_photo_path && cover_photo_path) {
        profile_photo = await uploadFileToCloudinary(profile_photo_path);
        cover_photo = await uploadFileToCloudinary(cover_photo_path);
      }

      const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        profile_photo,
        cover_photo,
      });

      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );

      if (!createdUser) {
        return res
          .status(500)
          .json({ message: "Something went wrong in register" });
      }

      return res
        .status(201)
        .json({ message: "User created successfully", user: createdUser });
    } catch (error) {
      if (profile_photo_path) {
        try {
          fs.unlinkSync(profile_photo_path);
        } catch (unlinkError) {
          console.error("Error deleting profile photo:", unlinkError);
        }
      }

      if (cover_photo_path) {
        try {
          fs.unlinkSync(cover_photo_path);
        } catch (unlinkError) {
          console.error("Error deleting cover photo:", unlinkError);
        }
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  },

  generateAccessTokenAndRefreshToken: async (userId) => {
    try {
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ message: "No User Found." });
      }

      const accessToken = await existingUser.generateAccessToken();
      const refreshToken = await existingUser.generateRefreshToken();

      existingUser.refresh_token = refreshToken;
      await existingUser.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },

  login: async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!existingUser) {
      return res.status(404).json({ message: "No User Found." });
    }

    const isPasswordMatch = await existingUser.isPasswordMatch(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } =
      await authController.generateAccessTokenAndRefreshToken(existingUser._id);

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refresh_token"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "User logged in successfully", user: loggedInUser });
  },

  generateNewRefreshToken: async (req, res) => {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No Refresh Token" });
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESHTOKEN_SECRET_KEY
      );

      const existingUser = await User.findById(decodedToken?._id);

      if (!existingUser) {
        return res.status(404).json({ message: "No User Found" });
      }

      if (incomingRefreshToken !== existingUser.refresh_token) {
        return res.status(401).json({ message: "Invalid Refresh Token" });
      }

      const { accessToken, refreshToken } =
        await authController.generateAccessTokenAndRefreshToken(
          existingUser._id
        );

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: "Token Updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },

  logout: async (req, res) => {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $unset: { refresh_token: 1 },
        },
        { new: true }
      );

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: `${req.user.username} logged out successfully` });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },
};

export default authController;
