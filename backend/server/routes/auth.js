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

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP via email using Resend API (works on Render) or SMTP fallback
 */
const sendOTP = async (email, otp, context = 'signup') => {
  console.log(`📧 Attempting to send OTP ${otp} to ${email}`);
  
  const isReset = context === 'reset';
  const subject = isReset 
    ? "Your Password Reset Code" 
    : "Your Signup Verification Code";
    
  const textContext = isReset 
    ? "Your OTP to reset your AlphaLegalGPT password is:" 
    : "Your OTP for AlphaLegalGPT signup is:";

  // Option 1: Use Resend API (HTTPS - works reliably on Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/v1/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'AlphaLegalGPT <onboarding@resend.dev>',
          to: email,
          subject: subject,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">AlphaLegalGPT Verification</h2>
            <p>${isReset ? 'You requested a password reset.' : 'Thank you for signing up!'}</p>
            <p>Your one-time password (OTP) is:</p>
            <div style="background-color: #f3f4f6; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block; border-radius: 5px; margin: 10px 0;">
              ${otp}
            </div>
            <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #6b7280;">If you did not request this code, you can safely ignore this email.</p>
          </div>`
        })
      });
      
      if (response.ok) {
        console.log(`✅ Email sent via Resend to ${email}`);
        return true;
      }
      console.error('Resend API error:', await response.text());
    } catch (error) {
      console.error('Resend failed, falling back:', error.message);
    }
  }

  // Option 2: Fallback to SMTP (nodemailer)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`⚠️ EMAIL not configured. OTP for ${email}: ${otp}`);
    return true;
  }

  // Dynamic import for nodemailer to avoid blocking
  const nodemailer = (await import('nodemailer')).default;
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    requireTLS: true,
    // Force IPv4 DNS lookup - critical for Render
    dnsLookup: (hostname, opts, callback) => {
      const dns = require('dns');
      dns.lookup(hostname, { family: 4 }, callback);
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"AlphaLegalGPT Assistant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: `${textContext} ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share this code with anyone.`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">AlphaLegalGPT Verification</h2>
        <p>${isReset ? 'You requested a password reset.' : 'Thank you for signing up!'}</p>
        <p>Your one-time password (OTP) is:</p>
        <div style="background-color: #f3f4f6; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block; border-radius: 5px; margin: 10px 0;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
        <p style="font-size: 12px; color: #6b7280;">If you did not request this code, you can safely ignore this email.</p>
      </div>`
    });
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ SMTP Error sending email:", error.message);
    throw error;
  }
};

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

/**
 * Authenticate user and return JWT token
 * @route POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { email, password } = value;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        type: 'auth_error'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        type: 'auth_error'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        type: 'verification_required',
        email: user.email
      });
    }

    const token = user.generateToken();
    res.json({ 
      success: true,
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Signup schema
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

/**
 * Register new user and send OTP for email verification
 * @route POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { name, email, password } = value;

  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        success: false,
        error: 'Database unavailable',
        type: 'service_unavailable'
      });
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

    // Non-blocking email send
    (async () => {
      try {
        await sendOTP(email, otp, 'signup');
        console.log(`✅ OTP sent to ${email}`);
      } catch (sendError) {
        console.error('OTP send failed:', sendError);
      }
    })();

    res.json({ 
      success: true,
      message: 'Account created. Check email for OTP.',
      email: email,
      requiresVerification: true
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered',
        type: 'duplicate_error'
      });
    }
    console.error('Signup error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Signup failed',
      type: 'signup_error'
    });
  }
});

// OTP schema
const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});

router.post('/verify-otp', async (req, res) => {
  const { error, value } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });
  }

  const { email, otp } = value;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found', type: 'not_found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account already verified', type: 'already_verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code', type: 'invalid_otp' });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP expired', type: 'otp_expired', canResend: true });
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      otp: undefined,
      otpExpiry: undefined
    });

    const token = user.generateToken();
    res.json({ success: true, message: 'Verified!', token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    res.status(500).json({ error: 'Verification error', type: 'server_error' });
  }
});

const resendSchema = Joi.object({ email: Joi.string().email().required() });

router.post('/resend-otp', async (req, res) => {
  const { error, value } = resendSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email } = value;

  try {
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(400).json({ error: 'Invalid request', type: 'invalid_request' });
    }

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry: expiry });

    (async () => {
      try { await sendOTP(email, otp); } catch (e) { console.error('Resend error:', e); }
    })();

    res.json({ success: true, message: 'OTP resent!' });

  } catch (error) {
    res.status(500).json({ error: 'Server error', type: 'server_error' });
  }
});

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

    if (!user) {
      return res.json({ success: true, message: 'If account exists, OTP sent.' });
    }

    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry: expiry, resetRequestedAt: Date.now() });

    (async () => {
      try { await sendOTP(email, otp, 'reset'); } catch (e) { console.error('Forgot error:', e); }
    })();

    res.json({ success: true, message: 'OTP sent.' });

  } catch (error) {
    res.status(500).json({ error: 'Server error', type: 'server_error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { error, value } = resetSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message, type: 'validation_error' });

  const { email, otp, newPassword } = value;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found', type: 'not_found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP', type: 'invalid_otp' });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP expired', type: 'otp_expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      isVerified: true,
      otp: undefined,
      otpExpiry: undefined,
      resetRequestedAt: undefined
    });

    res.json({ success: true, message: 'Password reset!' });

  } catch (error) {
    res.status(500).json({ error: 'Server error', type: 'server_error' });
  }
});

export default router;