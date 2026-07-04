import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Path is now ../users.json because this file is in data/models/
const DATA_PATH = join(__dirname, '../users.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = join(__dirname, '..');
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
  }
};

const readUsers = async () => {
  await ensureDataDir();
  const data = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(data);
};

const writeUsers = async (users) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2));
};

export class User {
  static async findByEmail(email) {
    const users = await readUsers();
    return users.find(u => u.email === email);
  }

  static async findById(id) {
    const users = await readUsers();
    return users.find(u => u._id === id);
  }

  static async create({ name, email, password }) {
    const users = await readUsers();
    const existing = users.find(u => u.email === email);
    
    if (existing) {
      if (existing.isVerified) {
        throw new Error('User already exists');
      } else {
        existing.name = name;
        existing.password = await bcrypt.hash(password, 10);
        await writeUsers(users);
        return existing;
      }
    }

    const newUser = {
      _id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: await bcrypt.hash(password, 10),
      isVerified: false,
      otp: null,
      otpExpiry: null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(users);
    return newUser;
  }

  static async updateOTP(email, otp, expiry) {
    const users = await readUsers();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].otp = otp;
      users[index].otpExpiry = expiry;
      await writeUsers(users);
      return users[index];
    }
    return null;
  }

  static async verifyOTP(email, otp) {
    const users = await readUsers();
    const index = users.findIndex(u => u.email === email);
    if (index === -1 || users[index].otp !== otp || Date.now() > users[index].otpExpiry) {
      return false;
    }
    users[index].isVerified = true;
    users[index].otp = undefined;
    users[index].otpExpiry = undefined;
    await writeUsers(users);
    return true;
  }

  static async resetPasswordWithOTP(email, otp, newPassword) {
    const users = await readUsers();
    const index = users.findIndex(u => u.email === email);
    
    // verify OTP synchronously in the same state
    if (index === -1 || users[index].otp !== otp || Date.now() > users[index].otpExpiry) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    // reset password
    users[index].password = await bcrypt.hash(newPassword, 10);
    users[index].isVerified = true;
    users[index].otp = undefined;
    users[index].otpExpiry = undefined;
    
    await writeUsers(users);
    return { success: true };
  }

  static async comparePassword(password, hashed) {
    return bcrypt.compare(password, hashed);
  }

  static generateToken(user) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  }

  // To maintain compatibility with findOneAndUpdate calls in server.js
  static async findOneAndUpdate(filter, update) {
    const users = await readUsers();
    const email = filter.email;
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      Object.assign(users[index], update);
      await writeUsers(users);
      return users[index];
    }
    return null;
  }
}
