const asyncHandler = require("express-async-handler");
const User         = require("../models/User");

// ── @desc    Get all users (admin)
// ── @route   GET /api/users
// ── @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// ── @desc    Get user by ID (admin)
// ── @route   GET /api/users/:id
// ── @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// ── @desc    Update user role (admin)
// ── @route   PUT /api/users/:id
// ── @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.name  = req.body.name  || user.name;
  user.email = req.body.email || user.email;
  user.role  = req.body.role  || user.role;

  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
});

// ── @desc    Delete user (admin)
// ── @route   DELETE /api/users/:id
// ── @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete an admin user");
  }
  await user.deleteOne();
  res.json({ message: "User deleted" });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };