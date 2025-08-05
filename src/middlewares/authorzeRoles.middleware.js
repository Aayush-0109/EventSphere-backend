import ApiError from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, _, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next( new ApiError(403, "Not authorized for this action"));
    }
    next();
  };
};

export default authorizeRoles;
