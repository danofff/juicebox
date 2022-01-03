const express = require("express");
const { getAllPosts, createPost, getPostById, updatePost } = require("../db");
const { requireUser, requireUserActive } = require("./utils");

const postsRouter = express.Router();

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");
  next();
});

//get all posts
postsRouter.get("/", async (req, res) => {
  const allPosts = await getAllPosts();

  const posts = allPosts.filter((post) => {
    if (
      (post.active && post.author.active) ||
      (post.active && req.user.id === post.author.id)
    ) {
      return true;
    }
    if (req.user && req.user.id === post.author.id) {
      return true;
    }
    return false;
  });
  res.send({
    posts,
  });
});
module.exports = postsRouter;

//add the post
postsRouter.post(
  "/",
  requireUser,
  requireUserActive,
  async (req, res, next) => {
    const { title, content, tags = "" } = req.body;

    const tagArr = tags.trim().split(/\s+/);
    const postData = {};
    if (tagArr.length) {
      postData.tags = tagArr;
    }

    try {
      postData.title = title;
      postData.content = content;
      postData.authorId = req.user.id;

      const post = await createPost(postData);
      if (post) {
        res.send({ post });
      } else {
        next({
          name: "ErrorCreatingPost",
          message: "Something went wrong while post creating",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

//edit the post
postsRouter.patch(
  "/:postId",
  requireUser,
  requireUserActive,
  async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
      updateFields.title = title;
    }

    if (content) {
      updateFields.content = content;
    }

    try {
      const originalPost = await getPostById(postId);
      if (originalPost.author.id === req.user.id) {
        console.log(originalPost.authorId, req.user.id);
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost });
      } else {
        next({
          name: "UnauthorizedUserError",
          message: "You cannot update a post that is not yours",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

//delete the post by ID
postsRouter.delete(
  "/:postId",
  requireUser,
  requireUserActive,
  async (req, res, next) => {
    try {
      const postId = req.params.postId;

      const post = await getPostById(postId);
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
        res.send({ post: updatedPost });
      } else {
        next(
          post
            ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours",
              }
            : {
                name: "PostNotFoundError",
                message: "That post does not exist",
              }
        );
      }
    } catch ({ name, message }) {
      next({
        name,
        message,
      });
    }
  }
);
