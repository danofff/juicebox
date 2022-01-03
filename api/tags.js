const express = require("express");
const { getAllTags, getPostsByTagName } = require("../db");
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();
  res.send({
    tags,
  });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const { tagName } = req.params;
  try {
    const allPosts = await getPostsByTagName(tagName);
    const posts = allPosts.filter((post) => {
      if (post.active && post.author.active) {
        return true;
      }

      return req.user && req.user.id === post.author.id;
    });
    res.send({ posts });
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});
module.exports = tagsRouter;
