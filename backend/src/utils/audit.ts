import prisma from './prisma';

export const logActivity = async (userId: number | null, action: string, details: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
