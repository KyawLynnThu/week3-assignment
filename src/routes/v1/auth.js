import { Router } from "express";
import authController from "../../controllers/auth.controller.js";
import { upload } from "../../middlewares/multer-storage.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  authController.register
);

router.post("/login", authController.login);

router.post("/refresh-token", authController.generateNewRefreshToken);

router.post("/logout", verifyJwt, authController.logout);

export default router;
