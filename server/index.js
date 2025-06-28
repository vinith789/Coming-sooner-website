const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Schema
const RegisterSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const Register = mongoose.model('Register', RegisterSchema);

// Route
app.post('/api/register', async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const newEntry = await Register.create({ name, email, phone });

    // Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});


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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
