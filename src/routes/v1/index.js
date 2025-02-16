import { Router } from "express";
import authRoutes from "./auth.js";
import postRoutes from "./post.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);

export default router;
