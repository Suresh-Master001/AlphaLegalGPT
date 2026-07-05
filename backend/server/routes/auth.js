import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
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
  return crypto.randomInt(100000, 999999).toString();
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendOTP = async (email, otp, context = 'signup') => {
  const isReset = context === 'reset';
  const action = isReset ? 'Password Reset' : 'Signup Verification';
  
  // Log OTP prominently for debugging/testing when email fails
  console.log(`\n🔐 ${action} OTP for ${email}: ${otp}\n`);
  
  try {
    await transporter.sendMail({
      from: `"AlphaLegalGPT" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isReset ? "Password Reset Code" : "Signup Verification Code",
      text: `${isReset ? 'Reset' : 'Signup'} OTP: ${otp}\nValid for 10 minutes.`,
      html: `<div><h2>AlphaLegalGPT</h2><p>OTP: <b>${otp}</b></p></div>`
    });
    console.log(`✅ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ SMTP Error (OTP was logged above):", error.message);
    // Don't throw - let the non-blocking caller handle gracefully
    // OTP is already logged and stored in DB
  }
};

// Login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email, password } = value;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials', type: 'auth_error' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Verify email first', type: 'verification_required', email: user.email });
    }
    res.json({ success: true, token: user.generateToken(), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', type: 'server_error' });
  }
});

// Signup
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

router.post('/signup', async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { name, email, password } = value;
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable', type: 'service_unavailable' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false
    });

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry: expiry });

    // Non-blocking email - OTP is stored in DB before send attempt
    // If SMTP fails, OTP is still available in the response
    (async () => {
      try {
        await sendOTP(email, otp, 'signup');
        console.log(`✅ OTP sent to ${email}`);
      } catch (sendError) {
        console.error('OTP send failed (OTP logged above):', sendError.message);
      }
    })();

    // Return OTP for testing when SMTP unavailable (remove in production)
    res.json({ 
      success: true, 
      message: 'Account created. Check email or view console logs.', 
      email, 
      requiresVerification: true,
      // Include OTP in response for testing when SMTP fails
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email exists', type: 'duplicate_error' });
    }
    res.status(400).json({ error: error.message || 'Signup failed', type: 'signup_error' });
  }
});

// verify-otp
const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});

router.post('/verify-otp', async (req, res) => {
  const { error, value } = otpSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email, otp } = value;
  try {
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ error: 'Invalid', type: 'invalid_request' });
    }
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP', type: 'invalid_otp' });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP expired', type: 'otp_expired', canResend: true });
    }

    await User.findByIdAndUpdate(user._id, { isVerified: true, otp: undefined, otpExpiry: undefined });
    const token = user.generateToken();
    res.json({ success: true, message: 'Verified!', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error', type: 'server_error' });
  }
});

// resend-otp
const resendSchema = Joi.object({ email: Joi.string().email().required() });

router.post('/resend-otp', async (req, res) => {
  const { error, value } = resendSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email } = value;
  try {
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ error: 'Invalid', type: 'invalid_request' });
    }

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry: expiry });

    (async () => {
      try { await sendOTP(email, otp); } catch (e) { console.error('Resend error:', e); }
    })();

    res.json({ success: true, message: 'OTP resent!' });
  } catch (error) {
    res.status(500).json({ error: 'Error', type: 'server_error' });
  }
});

// forgot-password
const forgotSchema = Joi.object({ email: Joi.string().email().required() });
const resetSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required()
});

router.post('/forgot-password', async (req, res) => {
  const { error, value } = forgotSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email } = value;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If exists, OTP sent.' });

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry: expiry });

    (async () => {
      try { await sendOTP(email, otp, 'reset'); } catch (e) { console.error('Forgot error:', e); }
    })();

    res.json({ success: true, message: 'OTP sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Error', type: 'server_error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { error, value } = resetSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email, otp, newPassword } = value;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid', type: 'invalid_otp' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      isVerified: true,
      otp: undefined,
      otpExpiry: undefined
    });

    res.json({ success: true, message: 'Password reset!' });
  } catch (error) {
    res.status(500).json({ error: 'Error', type: 'server_error' });
  }
});

export default router;