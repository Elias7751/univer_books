import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(9),
  password: z.string().min(6),
  universityId: z.number().optional(),
  collegeId: z.number().optional(),
  departmentId: z.number().optional(),
  majorId: z.number().optional(),
  levelId: z.number().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(9),
  password: z.string(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, password, universityId, collegeId, departmentId, majorId, levelId } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      res.status(400).json({ message: 'Phone number already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        universityId,
        collegeId,
        departmentId,
        majorId,
        levelId,
        // Default role is STUDENT as per schema
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        universityId: user.universityId,
        collegeId: user.collegeId,
        departmentId: user.departmentId,
        majorId: user.majorId,
        levelId: user.levelId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPasswordSchema = z.object({
  phone: z.string().min(9),
});

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: expires,
      },
    });

    const message = `مرحباً ${user.name}،\n\nرمز التحقق الخاص بك لاستعادة كلمة المرور هو: *${otp}*\n\nهذا الرمز صالح لمدة 15 دقيقة.`;
    
    if (user.telegramId) {
      try {
        const { bot } = require('../bot/telegram.bot');
        if (bot) {
          bot.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' });
        }
      } catch (err) {
        console.error('Failed to send OTP via Telegram:', err);
      }
    } else {
      console.log(`[OTP Simulation] OTP for ${phone} is: ${otp}`);
      res.status(400).json({ message: 'حسابك غير مربوط بالتيليجرام. يرجى ربط حسابك أولاً عبر البوت لاستلام رمز التحقق.' });
      return;
    }

    res.json({ message: 'تم إرسال رمز التحقق إلى حسابك في تيليجرام بنجاح.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPasswordSchema = z.object({
  phone: z.string().min(9),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
