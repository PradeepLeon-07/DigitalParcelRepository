const express = require('express');
const Parcel = require('../models/Parcel');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const sendOtpEmail = require('../utils/mailer');

const router = express.Router();

const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));

// POST /api/parcels — admin logs a new parcel
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { trackingId, courierCompany, recipientRoll } = req.body;
  const recipient = await User.findOne({ rollNumber: recipientRoll, role: 'student' });
  if (!recipient) return res.status(404).json({ message: 'Student not found' });

  const otp = genOtp();
  const parcel = await Parcel.create({ trackingId, courierCompany, recipient: recipient._id, otp });
  await sendOtpEmail(recipient.email, recipient.name, trackingId, otp);
  res.status(201).json(parcel);
}));

// GET /api/parcels/mine — student sees all their parcels
router.get('/mine', protect, asyncHandler(async (req, res) => {
  const parcels = await Parcel.find({ recipient: req.user._id }).sort('-createdAt');
  res.json(parcels);
}));

// PATCH /api/parcels/release — admin verifies OTP and marks PickedUp
router.patch('/release', protect, adminOnly, asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ message: 'OTP is required' });

  const parcel = await Parcel.findOne({ otp, status: 'Arrived' });
  if (!parcel) return res.status(404).json({ message: 'Invalid or already used OTP' });

  parcel.status = 'PickedUp';
  parcel.otp = '';
  await parcel.save();
  res.json({ message: 'Parcel marked as PickedUp', parcel });
}));

// GET /api/parcels/search?roll=XXXX — admin searches by roll number
router.get('/search', protect, adminOnly, asyncHandler(async (req, res) => {
  const { roll } = req.query;
  if (!roll) return res.status(400).json({ message: 'Roll number is required' });

  const student = await User.findOne({ rollNumber: roll, role: 'student' });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const parcels = await Parcel.find({ recipient: student._id }).sort('-createdAt');
  res.json({ student: { name: student.name, email: student.email }, parcels });
}));

// GET /api/parcels/dashboard — admin dashboard stats
router.get('/dashboard', protect, adminOnly, asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const overdueThreshold = new Date(Date.now() - 72 * 60 * 60 * 1000);

  const [todayCount, pendingCount, overdueCount, pendingParcels] = await Promise.all([
    Parcel.countDocuments({ createdAt: { $gte: startOfDay } }),
    Parcel.countDocuments({ status: 'Arrived' }),
    Parcel.countDocuments({ status: 'Arrived', createdAt: { $lte: overdueThreshold } }),
    Parcel.find({ status: 'Arrived' })
      .populate('recipient', 'name rollNumber email')
      .sort('-createdAt'),
  ]);

  res.json({ todayCount, pendingCount, overdueCount, pendingParcels });
}));

module.exports = router;
