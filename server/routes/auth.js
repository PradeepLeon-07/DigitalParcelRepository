const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, rollNumber, email, password } = req.body;
  if (await User.findOne({ $or: [{ email }, { rollNumber }] }))
    return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, rollNumber, email, password });
  res.status(201).json({ token: signToken(user._id), role: user.role, name: user.name });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: signToken(user._id), role: user.role, name: user.name });
}));

module.exports = router;
