import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer-storage.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  authController.register
);

export default router;
