import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { User } from "../models/user.js";

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
};

export default authController;
