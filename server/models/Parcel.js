const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true },
    courierCompany: {
      type: String,
      enum: ['Amazon', 'Flipkart', 'DTDC', 'BlueDart', 'Other'],
      required: true,
    },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, default: '' },
    status: { type: String, enum: ['Arrived', 'PickedUp'], default: 'Arrived' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parcel', parcelSchema);
