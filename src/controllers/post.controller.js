import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.js";

const postController = {
  lists: async (req, res) => {
    try {
      const data = await Post.find();
      return res.status(200).json({ message: "Post Lists", data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },

  create: async (req, res) => {
    try {
      const { title, description } = req.body;
      const data = await Post.create({ title, description });
      return res.status(201).json({ message: "Post Created", data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },

  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await Post.findById(id);
      if (!data) {
        return res.status(404).json({ message: "Post Not Found" });
      }
      return res.status(200).json({ message: "Post Details", data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post Not Found" });
      }

      const data = await Post.findByIdAndUpdate(
        id,
        { title, description },
        { new: true }
      );
      return res.status(200).json({ message: "Post Updated", data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post Not Found" });
      }

      await Post.findByIdAndDelete(id);
      return res.status(200).json({ message: "Post Deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something was wrong" });
    }
  },
};

export default postController;
