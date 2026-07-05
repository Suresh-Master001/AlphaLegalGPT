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
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Fail fast instead of hanging forever (prevents frontend Abort timeout)
  connectionTimeout: 10_000, // 10s
  greetingTimeout: 10_000, // 10s
  socketTimeout: 10_000, // 10s
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
      to: email,
      subject: subject,
      text: `${textContext} ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share this code with anyone.`,
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
      `,
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

/**
 * Authenticate user and return JWT token
 * @route POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { email, password } = value;

  try {
    console.log('🔐 Login attempt for:', email);

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        type: 'auth_error'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        type: 'auth_error'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        type: 'verification_required',
        email: user.email
      });
    }

    // Generate JWT token
    const token = user.generateToken();

    // Return success response
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
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
  // Validate request body
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { name, email, password } = value;

  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected during signup. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        success: false,
        error: 'Database connection unavailable. Please try again later.',
        type: 'service_unavailable'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false
    });

    // Generate and save OTP
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    
    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry: expiry
    }, { new: true });

    // Send OTP email (non-blocking)
    // If SMTP/email is slow, frontend should not fail with Abort timeout.
    // OTP is already stored in Mongo before this.
    (async () => {
      try {
        await sendOTP(email, otp, 'signup');
        console.log(`✅ Signup OTP email queued/sent for ${email}`);
      } catch (sendError) {
        console.error('OTP send error (non-blocking):', sendError);
      }
    })();

    res.json({ 
      success: true,
      message: 'Account created. If email is delayed, request a new OTP.',
      email: email,
      requiresVerification: true,
      emailDelivery: 'pending'
    });


  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered. Please use a different email or login.',
        type: 'duplicate_error'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: messages.join(', '),
        type: 'validation_error'
      });
    }
    
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

/**
 * Verify OTP and activate user account
 * @route POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  // Validate request body
  const { error, value } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { email, otp } = value;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        type: 'not_found'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        error: 'Account already verified. Please login.',
        type: 'already_verified'
      });
    }

    // Validate OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ 
        error: 'Invalid OTP code',
        type: 'invalid_otp'
      });
    }

    // Check OTP expiry
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ 
        error: 'OTP has expired. Please request a new one.',
        type: 'otp_expired',
        canResend: true
      });
    }

    // Verify user and clear OTP
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      otp: undefined,
      otpExpiry: undefined
    });

    // Generate JWT token
    const token = user.generateToken();

    console.log(`✅ Email verified for ${email}`);

    res.json({ 
      success: true,
      message: 'Email verified successfully!',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ 
      error: 'Server error during verification',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resend OTP schema
const resendSchema = Joi.object({
  email: Joi.string().email().required()
});

/**
 * Resend OTP to user's email
 * @route POST /api/auth/resend-otp
 */
router.post('/resend-otp', async (req, res) => {
  // Validate request body
  const { error, value } = resendSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { email } = value;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        type: 'not_found'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        error: 'Account already verified. Please login.',
        type: 'already_verified'
      });
    }

    // Check rate limiting (optional: prevent spam)
    if (user.otpExpiry && Date.now() < user.otpExpiry - 5 * 60 * 1000) {
      const remainingTime = Math.ceil((user.otpExpiry - 5 * 60 * 1000 - Date.now()) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${remainingTime} seconds before requesting a new OTP`,
        type: 'rate_limited',
        remainingTime
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry: expiry
    });

    // Send OTP email
    await sendOTP(email, otp);
    console.log(`📧 OTP resent to ${email}`);

    res.json({ 
      success: true,
      message: 'OTP resent successfully to your email!',
      email: email
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      error: 'Server error while resending OTP',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

/**
 * Request password reset OTP
 * @route POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  // Validate request body
  const { error, value } = forgotSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { email } = value;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      console.log(`ℹ️ Password reset requested for non-existent email: ${email}`);
      return res.json({ 
        success: true,
        message: 'If an account exists, a reset OTP has been sent.',
        type: 'generic_response'
      });
    }

    // Generate reset OTP
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000;
    
    await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry: expiry,
      resetRequestedAt: Date.now()
    });
    
    // Send reset OTP
    await sendOTP(email, otp, 'reset');
    
    console.log(`📧 Password reset OTP sent to ${email}`);

    res.json({ 
      success: true,
      message: 'OTP sent successfully for password reset.',
      type: 'otp_sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Server error while generating OTP',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Reset user password with OTP verification
 * @route POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  // Validate request body
  const { error, value } = resetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      type: 'validation_error'
    });
  }

  const { email, otp, newPassword } = value;

  try {
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        type: 'not_found'
      });
    }

    // Validate OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ 
        error: 'Invalid or expired OTP',
        type: 'invalid_otp'
      });
    }

    // Check OTP expiry
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ 
        error: 'OTP has expired. Please request a new one.',
        type: 'otp_expired',
        canResend: true
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      isVerified: true,
      otp: undefined,
      otpExpiry: undefined,
      resetRequestedAt: undefined
    });

    console.log(`🔑 Password reset successful for ${email}`);

    res.json({ 
      success: true,
      message: 'Password has been successfully reset!',
      type: 'password_updated'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Server error during password reset',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;