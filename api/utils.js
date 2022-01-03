function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  }
  next();
}

function requireUserActive(req, res, next) {
  if (!req.user.active) {
    next({
      name: "InactiveUserError",
      message: "You must have active account to perform this action",
    });
  }
  next();
}

module.exports = {
  requireUser,
  requireUserActive,
};
