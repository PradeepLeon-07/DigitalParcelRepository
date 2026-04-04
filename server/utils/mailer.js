const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendOtpEmail = async (to, name, trackingId, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your parcel has arrived',
    html: `<p>Hi ${name},</p>
           <p>Your parcel <strong>${trackingId}</strong> has arrived at the hostel gate.</p>
           <p>Your collection OTP: <strong style="font-size:1.5rem">${otp}</strong></p>
           <p>Show this OTP to the admin when you collect your parcel.</p>`,
  });
};

module.exports = sendOtpEmail;
