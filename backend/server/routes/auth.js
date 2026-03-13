import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { User } from '../models/User.js';

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

const sendOTP = async (email, otp) => {
  console.log(`📧 OTP ${otp} sent to ${email} - Check console for OTP!`);
  return true;
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

    const user = User.findByEmail(email);
    if (!user || !(await User.comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = User.generateToken(user);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
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
    await sendOTP(email, otp);

    res.json({ message: 'OTP sent - check console!', email });
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

    const user = User.findByEmail(email);
    const token = User.generateToken(user);

    res.json({ 
      token, 
      user: { 
        id: user.id, 
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

    res.json({ message: 'OTP resent - check console!' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

