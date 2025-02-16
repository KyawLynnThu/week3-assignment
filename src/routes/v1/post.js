import { Router } from "express";
import { verifyJwt } from "../../middlewares/auth.middleware.js";
import postController from "../../controllers/post.controller.js";

const router = Router();

router
  .route('/')
  .get(verifyJwt, postController.lists)
  .post(
    verifyJwt,
    postController.create,
  );

router
  .route('/:id')
  .get(verifyJwt, postController.getOne)
  .put(
    verifyJwt,
    postController.update,
  )
  .delete(verifyJwt, postController.delete);

export default router;
