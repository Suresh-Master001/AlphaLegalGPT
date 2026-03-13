import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const users = new Map(); // In-memory DB for simplicity

export class User {
  static findByEmail(email) {
    return Array.from(users.values()).find(u => u.email === email);
  }

  static async create({ name, email, password }) {
    const existing = User.findByEmail(email);
    if (existing) throw new Error('User exists');

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id,
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp: null,
      otpExpiry: null,
      createdAt: Date.now()
    };

    users.set(id, user);
    return user;
  }

  static async updateOTP(email, otp, expiry) {
    const user = User.findByEmail(email);
    if (user) {
      user.otp = otp;
      user.otpExpiry = expiry;
    }
  }

  static verifyOTP(email, otp) {
    const user = User.findByEmail(email);
    if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
      return false;
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    return true;
  }

  static async comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
  }

  static findById(id) {
    return users.get(id);
  }

  static generateToken(user) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  }

}

