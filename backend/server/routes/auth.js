import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { User } from '../data/models/User.js';
import nodemailer from 'nodemailer';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp, context = 'signup') => {
  console.log(`📧 Attempting to send OTP ${otp} to ${email}`);
  try {
    const isReset = context === 'reset';
    const subject = isReset 
      ? "Your Password Reset Code" 
      : "Your Signup Verification Code";
      
    const textContext = isReset 
      ? "Your OTP to reset your AlphaLegalGPT password is:" 
      : "Your OTP for AlphaLegalGPT signup is:";

    let info = await transporter.sendMail({
      from: `"AlphaLegalGPT Assistant" <${process.env.EMAIL_USER}>`,
      to: email, // list of receivers
      subject: subject, // Subject line
      text: `${textContext} ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share this code with anyone.`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">AlphaLegalGPT Verification</h2>
          <p>${isReset ? 'You requested a password reset.' : 'Thank you for signing up!'}</p>
          <p>Your one-time password (OTP) is:</p>
          <div style="background-color: #f3f4f6; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block; border-radius: 5px; margin: 10px 0;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #6b7280;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `, // html body
    });
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error('Failed to send email. Ensure your email configuration is correct.');
  }
};

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// POST /login
router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email, password } = value;
    console.log('🔐 Login attempt for:', email);

    const user = await User.findByEmail(email);
    if (!user || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = User.generateToken(user);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup schema
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// POST /signup
router.post('/signup', async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { name, email, password } = value;

    const user = await User.create({ name, email, password });

    // Send OTP
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 min
    await User.updateOTP(email, otp, expiry);
    
    try {
      await sendOTP(email, otp);
    } catch (sendError) {
      return res.status(400).json({ error: sendError.message || 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully to your email!', email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

// OTP schema
const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});

// POST /verify-otp
router.post('/verify-otp', async (req, res) => {
  const { error, value } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email, otp } = value;

    const success = User.verifyOTP(email, otp);
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findByEmail(email);
    const token = User.generateToken(user);

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend OTP schema
const resendSchema = Joi.object({
  email: Joi.string().email().required()
});

// POST /resend-otp
router.post('/resend-otp', async (req, res) => {
  const { error, value } = resendSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email } = value;

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    await User.updateOTP(email, otp, expiry);
    await sendOTP(email, otp);

    res.json({ message: 'OTP resent successfully to your email!' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password schemas
const forgotSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required()
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { error, value } = forgotSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email } = value;
    const user = await User.findByEmail(email);

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return res.json({ message: 'If an account exists, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    await User.updateOTP(email, otp, expiry);
    
    await sendOTP(email, otp, 'reset');
    res.json({ message: 'OTP sent successfully for password reset.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error while generating OTP' });
  }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
  const { error, value } = resetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email, otp, newPassword } = value;

    // Atomically Verify OTP and Update Password
    const result = await User.resetPasswordWithOTP(email, otp, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: 'Password has been successfully reset!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

export default router;

