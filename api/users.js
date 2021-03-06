const express = require("express");
const jwt = require("jsonwebtoken");

const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
  updateUser,
} = require("../db");
const { requireUser } = require("./utils");
const usersRouter = express.Router();

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

//get all users
usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.send({
    users,
  });
});

//login user
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);
    console.log(user.password, password);

    if (user && user.password === password) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );
      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//register a new user
usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({ message: "thank you for signing up", token });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", requireUser, async (req, res, next) => {
  const userId = req.params.userId;

  console.log(userId, req.user.id);
  if (req.user.id !== +userId) {
    next({
      name: "UnauthorizedUserError",
      message: "You cannot deactivate this account",
    });
  }
  try {
    const user = await getUserById(userId);

    console.log("------------------->", user, user.active);
    if (user && user.active) {
      const updatedUser = await updateUser(userId, { active: false });
      res.send({ user: updatedUser });
    } else {
      next({
        name: "NoSuchUser",
        message: "There is no such user or accaut already deactiveted",
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

module.exports = usersRouter;
