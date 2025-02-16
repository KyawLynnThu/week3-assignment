import { Router } from "express";
import versionOneRoutes from "./v1/index.js";
const router = Router();

router.use("/v1", versionOneRoutes);

export default router;
