const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

/* ===============================
   Register Schema (Already Present)
=================================*/
const RegisterSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});
const Register = mongoose.model('Register', RegisterSchema);

/* ===============================
   Feedback Schema (NEW)
=================================*/
const FeedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  college: String,
  course: String,
  feedback: String,
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// Nodemailer transporter (common)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

/* ===============================
   Route: Register (Already Present)
=================================*/
app.post('/api/register', async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const newEntry = await Register.create({ name, email, phone });

    // Mail to user
    await transporter.sendMail({
      from: `"Bright Future Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for Registering!",
      html: `<p>Dear ${name},</p><p>Thank you for registering with Bright Future Academy.</p><p>We will contact you soon.</p>`
    });

    // Mail to admin
    await transporter.sendMail({
      from: `"Bright Future Academy" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Registration Received",
      html: `<h3>New Registration Details</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone}</p>`
    });

    res.status(200).json({ message: "Registration successful and emails sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during registration" });
  }
});

/* ===============================
   Route: Feedback (ENHANCED)
=================================*/
app.post('/api/feedback', async (req, res) => {
  const { name, email, college, course, feedback } = req.body;

  try {
    const newFeedback = await Feedback.create({ name, email, college, course, feedback });

    /* =======================
       Mail to User
    ==========================*/
    await transporter.sendMail({
      from: `"Bright Future Academy 🌟" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Thank You ${name}! Your Feedback Means a Lot 💬`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 10px; color: #333;">
          <h2 style="color:#4CAF50;">🙌 Dear ${name},</h2>
          <p>Thank you for sharing your feedback about our <b>${course}</b> course.</p>

          <p style="font-size: 16px; line-height: 1.6;">
            Your thoughts are 💎 valuable to us and will help us grow 📈 and make our
            academy even better for students like you. 🎓
          </p>

          <blockquote style="border-left: 5px solid #4CAF50; padding-left: 10px; margin: 20px 0; font-style: italic; color: #555;">
            "${feedback}"
          </blockquote>

          <p>We truly appreciate the time you took to help us improve. 🌟</p>
          <br>
          <p style="color: #555;">With gratitude,<br><b>Bright Future Academy Team 🚀</b></p>
        </div>
      `
    });

    /* =======================
       Mail to Admin
    ==========================*/
    await transporter.sendMail({
      from: `"Bright Future Academy 📩" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📝 New Feedback from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #fff; padding: 20px; border-radius: 10px; color: #333;">
          <h2 style="color:#2196F3;">📢 New Feedback Received</h2>
          <p><b>👤 Name:</b> ${name}</p>
          <p><b>📧 Email:</b> ${email}</p>
          <p><b>🏫 College:</b> ${college}</p>
          <p><b>📚 Course:</b> ${course}</p>
          <hr>
          <h3>💬 Feedback:</h3>
          <p style="font-style: italic; color:#444;">"${feedback}"</p>
          <br>
          <p style="color: #777; font-size: 12px;">This is an automated email from Bright Future Academy system.</p>
        </div>
      `
    });

    res.status(200).json({ message: "Feedback submitted Thanks for Your Feedback" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Error during feedback submission" });
  }
});
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
