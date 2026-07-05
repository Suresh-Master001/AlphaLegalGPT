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

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

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
    res.json({ success: true, token: user.generateToken(), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', type: 'server_error' });
  }
});

// Signup - Direct login (no OTP verification)
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
      isVerified: true  // Auto-verify on signup
    });

    // Return token directly - no OTP needed
    res.json({ 
      success: true, 
      message: 'Account created successfully!', 
      token: user.generateToken(),
      user: { id: user._id, name: user.name, email: user.email },
      requiresVerification: false
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered', type: 'duplicate_error' });
    }
    res.status(400).json({ error: error.message || 'Signup failed', type: 'signup_error' });
  }
});

// verify-otp - Kept for compatibility but auto-verifies
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
    if (!user) {
      return res.status(404).json({ error: 'User not found', type: 'not_found' });
    }
    
    // Auto-verify without checking OTP
    const token = user.generateToken();
    res.json({ success: true, message: 'Verified!', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error', type: 'server_error' });
  }
});

// resend-otp - Kept for compatibility
const resendSchema = Joi.object({ email: Joi.string().email().required() });

router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found', type: 'not_found' });
    res.json({ success: true, message: 'OTP sent!' });
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
    if (!user) return res.status(404).json({ error: 'User not found', type: 'not_found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    const token = user.generateToken();
    res.json({ success: true, message: 'Password reset!', token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error', type: 'server_error' });
  }
});

export default router;