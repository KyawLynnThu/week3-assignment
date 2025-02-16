import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: "do9ilvlli",
  api_key: "832181589145164",
  api_secret: process.env.CLOUDINARY_API_SECRT,
});

export const uploadFileToCloudinary = async (filePath) => {
  try {
    if (filePath === null) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully", response.url);
    fs.unlinkSync(filePath);
    return response.url;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(filePath);
    return null;
  }
};
