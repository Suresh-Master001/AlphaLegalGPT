import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class User {
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      }
    });
  }

  static async updateOTP(email, otp, expiry) {
    return prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry: expiry,
      }
    });
  }

  static async verifyOTP(email, otp) {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
      return false;
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      }
    });
    
    return true;
  }

  static async resetPasswordWithOTP(email, otp, newPassword) {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isVerified: true,
        otp: null,
        otpExpiry: null,
      }
    });
    
    return { success: true };
  }

  static async comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
  }

  static generateToken(user) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  }

  static async findOneAndUpdate(filter, update) {
    return prisma.user.update({
      where: { email: filter.email },
      data: update
    });
  }
}

export default prisma;