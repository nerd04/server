import PostModel from "../models/PostModel.js";
import TopicModel from "../models/TopicModel.js";

const createPost = async (req, res, next) => {
  try {
    const { title, description, codeSnippet, topic, tags, image } = req.body;

    // 🔒 Auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // ✅ Validation
    if (!title || !description || !topic) {
      return res.status(400).json({
        success: false,
        message: "Title, description and topic are required"
      });
    }

    // ✅ Check topic exists
    const existingTopic = await TopicModel.findOne({name: topic});
    if (!existingTopic) {
      return res.status(400).json({
        success: false,
        message: "Invalid topic"
      });
    }

    // ✅ Normalize tags
    // const normalizedTags = tags?.map(tag => tag.toLowerCase().trim()) || [];

    // ✅ Create post
    const post = await PostModel.create({
      title,
      description,
      codeSnippet,
      image,
      topic: existingTopic._id,
      tags,
      author: req.user._id
    });

    return res.status(201).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error("Create Post Error:", error);
    next(error); // pass to global error handler
  }
};

export { createPost };